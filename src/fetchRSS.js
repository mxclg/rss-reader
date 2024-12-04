import axios from 'axios';

const allOriginsBaseURL = 'https://allorigins.hexlet.app/get';

const fetchRSS = async (url) => {
  try {
    const response = await axios.get(allOriginsBaseURL, {
      params: {
        url,
        disableCache: true,
      },
    });
    return response.data.contents;
  } catch (error) {
    throw new Error('validation.netError');
  }
};

export default fetchRSS;
