import * as yup from 'yup';
import initView from './view.js'; // Импортируем функцию для инициализации view

// Основная функция приложения
const app = () => {
  // Инициализируем состояние
  const state = {
    form: {
      valid: true,
      error: '',
    },
    feeds: [],
  };

  const watchedState = initView(state); // Оборачиваем состояние для отслеживания изменений

  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');

  // Схема валидации URL
  const schema = yup.string().url('Некорректный URL').required('URL не должен быть пустым');

  // Функция валидации и добавления URL
  const validateAndAddFeed = (url) => {
    return schema
      .validate(url)
      .then((validUrl) => {
        if (watchedState.feeds.includes(validUrl)) {
          throw new Error('Этот RSS уже добавлен');
        }
        watchedState.feeds.push(validUrl);
        watchedState.form.valid = true;
        watchedState.form.error = '';
      })
      .catch((error) => {
        watchedState.form.valid = false;
        watchedState.form.error = error.message;
      });
  };

  // Обработчик события submit
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = input.value.trim();
    validateAndAddFeed(url);
  });
};

export default app;