// /api/getTalk.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { id } = req.query; // Assuming you pass the talk ID as a query parameter

    const options = {
      method: 'GET',
      url: `https://api.d-id.com/talks/${id}`,
      headers: {
        accept: 'application/json',
        // Ensure you securely manage and store your API keys
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    }
    };

    try {
      const response = await axios.request(options);
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
