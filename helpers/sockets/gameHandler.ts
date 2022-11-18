import axios from 'axios';
import GLOBALS from '../../global.json';

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
            return (null)
        })
}

export default (io: any, socket: any) => {
    // update game progress
    const updateGame = (room: any) => {
        console.log('Update lobby')
        // emit update-game
        // handle guesses, lives and winner update
    }

    // start game
    // update game progress
    const startGame = async (msg: any) => {
        // chekc if sender is host
        if (socket.is_host && msg.code) {
            // fetch word
            const newWord = await fetchWord()
            // send word to all clients
            io.in(msg.code).emit('start-game', newWord)
        }
    }

    // update error channel
    // update game progress
    const errorGame = (room: any) => {
        console.log('Update lobby')
        // emit update-game
        // handle guesses, lives and winner update
    }
    socket.on("update", updateGame);
    socket.on("start", startGame);
    socket.on("error", errorGame);
};