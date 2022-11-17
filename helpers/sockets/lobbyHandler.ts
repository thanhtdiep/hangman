export default (io: any, socket: any) => {
    const createLobby = async (data: any) => {
        socket.join(data.code)
        console.log('[socket]', 'join room :', data.code)
        const sockets = await io.in(data.code).fetchSockets();
        // config players
        var newList: any = [];
        sockets.map((s: any) => {
            const newPlayer = {
                id: s.id,
                name: data.code,
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
                name: room,
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

    const updateLobby = (room: any) => {
        console.log('Update lobby')
    }

    socket.on("create", createLobby);
    socket.on("leave", leaveLobby);
    socket.on("update", updateLobby);
};