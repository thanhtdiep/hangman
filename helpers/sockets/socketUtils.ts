const MAX_PLAYERS = 4;
export const checkLobbyCap = async (socket: any, io: any) => {
    const sockets = await io.in(socket.room).fetchSockets();
    if (sockets.length > MAX_PLAYERS - 1) {
        return true;
    }
    return false;
}

export const checkLobbyReady = async (socket: any, io: any) => {
    const sockets = await io.in(socket.room).fetchSockets();
    const allReady = sockets.find((p:any) => {
        return p.ready === false;
    }) 
    return allReady;
}