const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://api.d-id.com/clips',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: `Bearer ${process.env.D_ID_API_KEY}` // Accessing API key from environment variable
},
  data: {
    script: {
      type: 'text',
      subtitles: 'false',
      provider: {type: 'microsoft', voice_id: 'en-US-JennyNeural'},
      ssml: 'false'
    },
    config: {result_format: 'mp4'},
    presenter_config: {crop: {type: 'rectangle'}}
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });