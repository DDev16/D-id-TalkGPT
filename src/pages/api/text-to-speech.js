import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method should be POST' });
  }

  const { text, voice = "alloy" } = req.body; // Defaulting to "alloy" voice if not specified
  const data = {
    model: "tts-1", // Use the appropriate TTS model, e.g., tts-1 or tts-1-hd
    input: text,
    voice: voice, // This can be alloy, echo, fable, onyx, nova, shimmer, etc.
  };

  const url = 'https://api.openai.com/v1/audio/speech';
  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Making the POST request to the OpenAI API
    const response = await axios.post(url, data, { headers: headers, responseType: 'arraybuffer' });
    
    // Sending the binary audio data as response
    // Setting the appropriate content type for the audio format (default is mp3)
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(response.data);
  } catch (error) {
    console.error(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      res.status(error.response.status).json({ message: "Error from OpenAI API", details: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
      res.status(500).json({ message: "No response received from OpenAI API" });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      res.status(500).json({ message: "Error setting up request to OpenAI API" });
    }
  }
}
