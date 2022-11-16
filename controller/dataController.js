const axios = require('axios');

const getOptions = () => {
  return {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
    },
  };
};

exports.getFixtures = (ID) => {
  const options = getOptions();

  options.url = `https://api-football-v1.p.rapidapi.com/v3/fixtures`;
  options.params = {
    id: ID,
  };

  return axios
    .request(options)
    .then((response) => response.data.response)
    .catch((err) => console.error(err));
};

exports.getFixturesStats = (id) => {
  const options = getOptions();
  options.url = `https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics`;

  options.params = {
    fixture: id,
  };

  return axios
    .request(options)
    .then((response) => response.data.response)
    .catch((err) => console.error(err));
};
