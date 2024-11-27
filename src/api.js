import axios from 'axios';

const allOriginsBaseURL = 'https://allorigins.hexlet.app/get';

const fetchRSS = async (url) => {
  try {
    const response = await axios.get(allOriginsBaseURL, {
      params: {
        url,
        disableCache: true, // Отключаем кеширование
      },
    });
    return response.data.contents; // Возвращаем HTML контент без декодирования
  } catch (error) {
    throw new Error('validation.netError'); // Сообщение об ошибке сети
  }
};

export default fetchRSS;
