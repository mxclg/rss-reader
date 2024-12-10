import axios from 'axios';

const allOriginsBaseURL = 'https://allorigins.hexlet.app/get';

const fetchRSS = (url) => axios.get(allOriginsBaseURL, {
  params: {
    url,
    disableCache: true,
  },
})
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('validation.netError');
  });

export default fetchRSS;
