// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'

import lobbyHandler from "../../helpers/sockets/lobbyHandler";
import gameHandler from "../../helpers/sockets/gameHandler";
type Data = {
    [x: string]: any
}

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseWithSocket
) {
    if (res.socket?.server.io) {
        console.log('Socket is already running')
        res.end();
        return;
    }

    console.log('Socket is initializing')
    const io = new IOServer(res.socket.server)
    res.socket.server.io = io

    const onConnection = (socket: any) => {
        lobbyHandler(io, socket)
        gameHandler(io, socket)
    }
    
    // Define actions inside
    io.on("connection", onConnection);
    res.end()
}
