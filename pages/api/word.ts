// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import GLOBALS from '../../global.json';

type Data = {
  [x: string]: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // get request payload

  // fetch from word ninja api
  await axios.get(GLOBALS.BASE_URL, {
    headers: {
      'X-Api-Key': process.env.NINJA_APIKEY
    }
  })
    .then((response) => {
      const word = response.data.word
      res.status(200).json({ word })
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
      res.status(400).json({
        data,
        config: err.config
      })
    })
}
