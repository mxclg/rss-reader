import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import initView from './view.js';
import fetchRSS from './api.js';
import parseRSS from './parse.js';

const app = async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => ({ key: 'validation.urlError' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'validation.notOneOf' }),
    },
  });

  const state = {
    form: {
      valid: true,
      error: '',
    },
    feeds: [],
    posts: [], // Добавлен массив для постов
  };

  const watchedState = initView(state);

  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');

  const schema = yup.string().url().required();

  const validateAndAddFeed = (url) => {
    watchedState.form.valid = null;
    watchedState.form.error = '';

    return schema
      .validate(url)
      .then((validUrl) => {
        if (watchedState.feeds.some((feed) => feed.url === validUrl)) {
          throw new Error('validation.notOneOf');
        }

        return fetchRSS(validUrl)
          .then((rssContent) => {
            const { feed, posts } = parseRSS(rssContent);

            // Добавляем фид с его URL
            watchedState.feeds.push({ ...feed, url: validUrl });

            // Добавляем посты в состояние
            posts.forEach((post) => {
              watchedState.posts.push({ ...post, feedUrl: validUrl }); // Связываем посты с фидом
            });

            watchedState.form.valid = true;
          });
      })
      .catch((error) => {
        watchedState.form.valid = false;
        const errorMessage = i18n.t(error.message?.key || error.message);
        watchedState.form.error = errorMessage;
      });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = input.value.trim();
    validateAndAddFeed(url);
  });
};

export default app;
