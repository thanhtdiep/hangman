// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Server as IOServer } from 'Socket.IO';
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import GLOBALS from '../../global.json';

import lobbyHandler from "../../helpers/sockets/lobbyHandler";
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

const fetchWord = async () => {
    // fetch from word ninja api
    await axios.get(GLOBALS.BASE_URL, {
        headers: {
            'X-Api-Key': process.env.NINJA_APIKEY
        }
    })
        .then((response) => {
            const word = response.data.word
            return ({ word })
        })
        .catch((err) => {
            var data = {
                status: 400,
                message: '',
                error: '',
                config: '',
            }
            if (err.response) {
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
                data.message = 'Failed to get new word. Please try again later!'
                data.error = err.response.data
                data.status = err.response.status
            } else if (err.request) {
                console.log(err.request);
                data.message = 'Failed to get new word. Please try again later!'
            } else {
                console.log('Error', err.message)
                data.message = err.message
            }
            console.log(err.config)
            return ({
                data,
                config: err.config
            })
        })
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
    }
    
    // Define actions inside
    io.on("connection", onConnection);
    res.end()
}
