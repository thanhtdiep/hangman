import axios from 'axios';
import GLOBALS from '../../global.json';

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
            console.log(word)
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
        console.log('Update lobby')
        console.log(msg)
        // emit update-game
        // handle guesses, lives and winner update
        if (msg.type == 'progress') {
            // send the updated guesss and lives
            msg.is_host = socket.is_host;
            // client loop through player on their state and update
            socket.in(msg.code).emit('update-game', msg);
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
            // render winner screen
            socket.in(socket.room).emit('update-game', msg);
        }
        
        // new gamer
        if (msg.type == 'new') {

        }
    }

    // start game
    // update game progress
    const startGame = async (msg: any) => {
        // chekc if sender is host
        if (socket.is_host && msg.code) {
            console.log('Game start!')
            let newWord = '';
            // fetch word
            await fetchWord().then((res) => newWord = res);
            // send word to all clients
            io.in(msg.code).emit('start-game', newWord)
        }
    }

    // update error channel
    // update game progress
    const errorGame = (msg: any) => {
        console.log('Update lobby')
        // emit update-game
        // handle guesses, lives and winner update
    }
    socket.on("update", updateGame);
    socket.on("start", startGame);
    socket.on("error", errorGame);
};