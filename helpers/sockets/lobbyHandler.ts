export default (io: any, socket: any) => {
    // store player array
    const createLobby = async (data: any) => {
        socket.nickname = data.name;
        socket.is_host = true;
        console.log(socket.nickname)
        socket.join(data.code)
        console.log('[socket]', 'join room :', data.code)
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newList: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                is_host: s.is_host,
                lives: 8,
                guesses: [],
            }
            newList.push(newPlayer)
        })
        console.log(socket.id)
        // update player list to host
        io.to(socket.id).emit('update-host', {
            is_host: true,
            code: data.code,
            players: newList
        });
    }

    const joinLobby = async (data: any) => {
        socket.nickname = data.name;
        socket.is_host = false;
        socket.join(data.code)
        console.log('[socket]', 'join room :', data.code)
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newList: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: s.nickname,
                is_host: s.is_host,
                lives: 8,
                guesses: [],
            }
            newList.push(newPlayer)
        })
        console.log(newList)
        // update player list
        io.in(data.code).emit('player-join', {
            code: data.code,
            players: newList
        });
    }

    const leaveLobby = async (room: any) => {
        socket.leave(room)
        console.log('User left lobby')
        // update remaing player for other client
        const sockets = await io.in(room).fetchSockets();
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