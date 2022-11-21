export default (io: any, socket: any) => {
    // store player array
    const createLobby = async (data: any) => {
        // inialise player stats
        socket.join(data.code)
        socket.nickname = data.name;
        socket.room = data.code;
        socket.is_host = true;
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newPlayers: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                is_host: s.is_host,
                lives: 8,
                guesses: [],
            }
            newPlayers.push(newPlayer)
        })
        socket.players = newPlayers;
        // join lobby
        console.log('[socket]', 'join room :', data.code)
        // update player list to host
        io.to(socket.id).emit('update-host', {
            is_host: true,
            code: data.code,
            players: newPlayers
        });
    }

    const joinLobby = async (data: any) => {
        if (!data.return) {
            socket.join(data.code)
            socket.is_host = false;
            socket.nickname = data.name;
            socket.room = data.code;
        }
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newPlayers: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                is_host: s.is_host,
                lives: 8,
                guesses: [],
            }
            newPlayers.push(newPlayer)
        })
        socket.players = newPlayers;
        console.log('[socket]', 'join room :', data.code)
        // update player list
        io.in(data.code).emit('player-join', {
            code: data.code,
            players: newPlayers
        });
    }

    const leaveLobby = async (room: any) => {
        socket.leave(room)
        console.log('User left lobby')
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
                lives: 8,
                guesses: [],
            }
            newList.push(newPlayer)
        })
        socket.to(room).emit('player-leave', {
            code: room,
            players: newList
        });
    }

    // update error channel

    socket.on("create", createLobby);
    socket.on("join", joinLobby);
    socket.on("leave", leaveLobby);
};