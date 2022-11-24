import axios from 'axios';
import GLOBALS from '../../global.json';
import { checkLobbyReady } from "../../helpers/sockets/socketUtils";

interface PlayerType {
    id: number,
    name: string,
    lives: number,
    guesses: string[]
}

const fetchWord = async () => {
    // fetch from word ninja api
    const result = await axios.get(GLOBALS.BASE_URL, {
        headers: {
            'X-Api-Key': process.env.NINJA_APIKEY
        }
    })
        .then((response) => {
            const word = response.data.word
            return word
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
            return (null)
        })
    return result
}

export default (io: any, socket: any) => {
    // update game progress
    const updateGame = (msg: any) => {
        // emit update-game
        // handle guesses, lives and winner update
        if (msg.type == 'progress') {
            // send the updated guesss and lives
            msg.is_host = socket.is_host;
            io.in(msg.code).emit('update-game', msg);
            // live check
            const players = msg.players;
            const stillPlaying = players.find((p: PlayerType) => {
                return p.lives > 0
            })
            if (!stillPlaying) {
                msg.type = 'lose';
                msg.description = "No one found the hidden word. Nice try tho!"
                io.in(msg.code).emit('update-game', msg);
            }
        }
        // we found a winner
        if (msg.type == 'winner') {
            // send winner info
            msg.id = socket.id;
            // render winner screen
            io.in(socket.room).emit('update-game', msg);
        }
    }

    // start game
    // update game progress
    const startGame = async (msg: any) => {
        // check all players in lobby ready
        const isReady = checkLobbyReady(socket, io)
        if (!isReady) {
            const msg = {
                description: 'Everyone needs to be ready to start',
                type: 'lobby-not-ready',
                className: 'bg-negative-red',
            };
            io.to(socket.id).emit('update-error', msg)
        }
        // check if sender is host
        if (socket.is_host && msg.code) {
            let newWord = '';
            // fetch word
            await fetchWord().then((res) => newWord = res);
            // send word to all clients
            io.in(msg.code).emit('start-game', newWord)
        }
    }
    socket.on("update", updateGame);
    socket.on("start", startGame);
};