import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import initView from './view.js';
import fetchRSS from './fetchRSS.js';
import parseRSS from './parse.js';

export default () => {
  const elements = {
    postsContainer: document.querySelector('.posts'),
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };

  const defaultLang = 'ru';

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      required: () => ({ key: 'validation.notEmpty' }),
    },
    string: {
      url: () => ({ key: 'validation.urlError' }),
    },
  });

  const state = {
    form: {
      valid: true,
      error: '',
      isLoading: false,
    },
    feeds: [],
    posts: [],
    ui: {
      readPosts: [],
      modal: null,
    },
  };

  const watchedState = initView(state, i18n);

  const errorHandling = (error, context) => {
    console.error(`Ошибка в ${context}:`, error.message);
    watchedState.form.error = i18n.t(error.message?.key || error.message);
  };

  const addFeed = (url) => {
    fetchRSS(url)
      .then((rssContent) => {
        const { feed, posts } = parseRSS(rssContent);

        watchedState.feeds.push({ ...feed, url });
        posts.forEach((post) => {
          watchedState.posts.push({ ...post, feedUrl: url });
        });

        watchedState.form.valid = true;
      })
      .catch((error) => {
        errorHandling(error, 'addFeed');
      });
  };

  const validationSchema = (feeds) => {
    const urls = feeds.map((feed) => feed.url);
    return yup.string().trim().required().url()
      .notOneOf(urls, 'validation.rssAlreadyExist');
  };

  const validateAndAddFeed = (url) => {
    watchedState.form.valid = null;
    watchedState.form.error = '';
    watchedState.form.isLoading = true; // Устанавливаем состояние загрузки

    const schema = validationSchema(watchedState.feeds);

    schema.validate(url)
      .then((validUrl) => addFeed(validUrl))
      .catch((error) => errorHandling(error, 'validateAndAddFeed'))
      .finally(() => {
        watchedState.form.isLoading = false; // Сбрасываем состояние загрузки
      });
  };

  const addNewPosts = (posts, existingLinks, feedUrl) => {
    const newPosts = posts.filter((post) => !existingLinks.includes(post.link));
    newPosts.forEach((post) => {
      const isRead = watchedState.ui.readPosts.includes(post.link);
      watchedState.posts.push({ ...post, feedUrl, isRead });
    });
  };

  const refreshSingleFeed = (feed) => {
    fetchRSS(feed.url)
      .then((rssContent) => {
        const { posts } = parseRSS(rssContent);
        const existingLinks = watchedState.posts.map((post) => post.link);
        addNewPosts(posts, existingLinks, feed.url);
      })
      .catch((error) => console.error(`Ошибка при обновлении фида ${feed.url}:`, error.message));
  };

  const updateAllFeeds = () => {
    if (watchedState.feeds.length === 0) {
      setTimeout(updateAllFeeds, 5000);
      return;
    }

    const promises = watchedState.feeds.map(refreshSingleFeed);

    Promise.all(promises).finally(() => {
      setTimeout(updateAllFeeds, 5000);
    });
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = elements.input.value.trim();
    validateAndAddFeed(url);
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;

    if (!id) return;

    const clickedPost = watchedState.posts.find((p) => p.link === id);

    if (!clickedPost) return;

    watchedState.ui.modal = clickedPost;

    const alreadyRead = watchedState.ui.readPosts.includes(id);
    if (!alreadyRead) {
      watchedState.ui.readPosts.push(id);
      watchedState.posts = [...watchedState.posts];
    }
  });

  updateAllFeeds();
};
