// api/createTalk.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { botMessage } = req.body;

    const options = {
      method: 'POST',
      url: 'https://api.d-id.com/talks',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic ZGV2ZXJhZGlsbG9uQGdtYWlsLmNvbTpDaGV3eTEzIQ=='
      },
      data: {
        script: {
          type: 'text',
          input: botMessage // Use the botMessage from the request
        },
        config: {fluent: 'false', pad_audio: '0.0'},
        source_url: 'https://scontent-sjc3-1.xx.fbcdn.net/v/t39.30808-6/347002014_186711793891874_5328164021055252806_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=G6fQ9dPGUvQAX8w8ube&_nc_ht=scontent-sjc3-1.xx&oh=00_AfB425pTJQ4xQRKp0IO9elqzG8W6bsTsdLJsFc1j1e4UYQ&oe=65CB038A'
      }
    };

    try {
      const response = await axios.request(options);
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
