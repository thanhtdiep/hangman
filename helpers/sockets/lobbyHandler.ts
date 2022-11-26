import { checkLobbyCap, checkEmptyLobby } from "../../helpers/sockets/socketUtils";

export default (io: any, socket: any) => {
    // store player array
    const createLobby = async (data: any) => {
        // inialise player stats
        socket.join(data.code)
        socket.nickname = data.name;
        socket.room = data.code;
        socket.status = '';
        socket.ready = false;
        socket.is_host = true;
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newPlayers: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                is_host: s.is_host,
                ready: s.ready,
                status: '',
                lives: 8,
                guesses: [],
            }
            newPlayers.push(newPlayer)
        })
        socket.players = newPlayers;
        // join lobby
        // update player list to host
        io.to(socket.id).emit('update-host', {
            is_host: socket.is_host,
            code: data.code,
            players: newPlayers
        });
    }

    const joinLobby = async (data: any) => {
        // chekc if lobby empty
        const isEmpty = await checkEmptyLobby(socket, io, data.code);
        if (!isEmpty) {
            const msg = {
                description: 'Lobby does not exist. Please enter a different code.',
                type: 'lobby-not-exist',
                className: 'bg-negative-red',
            };
            io.to(socket.id).emit('update-error', msg)
            return;
        }
        // check lobby count (MAX: 4)
        const isEnoughPlayers = await checkLobbyCap(socket, io, data.code);
        if (!isEnoughPlayers) {
            const msg = {
                description: 'Lobby is full! Please try again later.',
                type: 'lobby-full',
                className: 'bg-negative-red',
            };
            io.to(socket.id).emit('update-error', msg)
            return;
        } else {
            // execution
            if (!data.return) {
                socket.join(data.code)
                socket.is_host = false;
                socket.status = '';
                socket.ready = false;
                socket.nickname = data.name;
                socket.room = data.code;
            }
            // grab lobby players to players list configure
            const sockets = await io.in(data.code).fetchSockets();
            // config players
            var newPlayers: any = [];
            sockets.map((s: any) => {
                const newPlayer = {
                    id: s.id,
                    name: s.nickname,
                    is_host: s.is_host,
                    ready: s.ready,
                    status: '',
                    lives: 8,
                    guesses: [],
                }
                newPlayers.push(newPlayer)
            })
            socket.players = newPlayers;
            // update player list
            io.in(data.code).emit('player-join', {
                id: socket.id,
                code: data.code,
                players: newPlayers
            });
            // execution
            if (!data.return) {
                socket.join(data.code)
                socket.is_host = false;
                socket.status = '';
                socket.ready = false;
                socket.nickname = data.name;
                socket.room = data.code;
            }
            // grab lobby players to players list configure
            const newSockets = await io.in(data.code).fetchSockets();
            // config players
            var newPlayers: any = [];
            newSockets.map((s: any) => {
                const newPlayer = {
                    id: s.id,
                    name: s.nickname,
                    is_host: s.is_host,
                    ready: s.ready,
                    status: '',
                    lives: 8,
                    guesses: [],
                }
                newPlayers.push(newPlayer)
            })
            socket.players = newPlayers;
            // update player list
            io.in(data.code).emit('player-join', {
                code: data.code,
                players: newPlayers
            });
        }
    }

    const leaveLobby = async () => {
        const room = socket.room;
        socket.leave(room)
        // update remaing player for other client
        const sockets = await io.in(room).fetchSockets();
        // check if player is host
        if (socket.is_host && sockets.length > 0) {
            socket.is_host = false
            sockets[0].is_host = true
            // pass host to another user
            io.to(sockets[0].id).emit('pass-host', {
                is_host: sockets[0].is_host
            });
        }
        // config players
        var newList: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                ready: s.ready,
                status: '',
                lives: 8,
                guesses: [],
            }
            newList.push(newPlayer)
        })
        socket.to(room).emit('player-leave', {
            code: room,
            players: newList
        });
        // clear socket room
        socket.room = null
    }

    const playerReady = async (ready: boolean) => {
        socket.ready = ready;
        io.in(socket.room).emit('update-ready', {
            id: socket.id,
            ready: ready
        });
    }

    // update error channel
    socket.on("create", createLobby);
    socket.on("join", joinLobby);
    socket.on("leave", leaveLobby);
    socket.on("ready", playerReady);
};