import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import initView from './view.js';
import fetchRSS from './fetchRSS.js';
import parseRSS from './parse.js';

const app = async () => {
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
  await i18n.init({
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
    },
    feeds: [],
    posts: [],
    ui: {
      readPosts: [],
    },
  };

  const watchedState = initView(state, i18n);

  const schema = yup.string().trim().required().url();

  const addFeed = async (url) => {
    const rssContent = await fetchRSS(url);
    const { feed, posts } = parseRSS(rssContent);

    watchedState.feeds.push({ ...feed, url });
    posts.forEach((post) => {
      watchedState.posts.push({ ...post, feedUrl: url });
    });

    watchedState.form.valid = true;
  };

  const checkFeedExists = (url) => {
    const feedAlreadyAded = watchedState.feeds.some((feed) => feed.url === url);
    if (feedAlreadyAded) {
      throw new Error('validation.notOneOf');
    }
  };

  const validateAndAddFeed = (url) => {
    watchedState.form.valid = null;
    watchedState.form.error = '';

    const validateURL = schema.validate(url);

    return validateURL
      .then((validUrl) => {
        checkFeedExists(validUrl);
        return addFeed(validUrl);
      })
      .catch((error) => {
        watchedState.form.valid = false;
        const errorMessage = i18n.t(error.message?.key || error.message);
        watchedState.form.error = errorMessage;
      });
  };

  const addNewPosts = (posts, existingLinks, feedUrl) => {
    const newPosts = posts.filter((post) => !existingLinks.includes(post.link));
    newPosts.forEach((post) => {
      const isRead = watchedState.ui.readPosts.includes(post.link);
      watchedState.posts.push({ ...post, feedUrl, isRead });
    });
  };

  const refreshSingleFeed = (feed) => fetchRSS(feed.url)
    .then((rssContent) => {
      const { posts } = parseRSS(rssContent);
      const existingLinks = watchedState.posts.map((post) => post.link);
      addNewPosts(posts, existingLinks, feed.url);
    })
    .catch((error) => {
      console.error(`Ошибка обновления фида ${feed.url}:`, error);
      watchedState.form.error = `Ошибка обновления фида: ${feed.url}`;
    });

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

    const { title, description, link } = clickedPost;
    elements.modalTitle.textContent = title;
    elements.modalBody.textContent = description;
    elements.modalLink.href = link;

    const alreadyRead = watchedState.ui.readPosts.includes(id);
    if (!alreadyRead) {
      watchedState.ui.readPosts.push(id);
      watchedState.posts = [...watchedState.posts];
    }
  });

  updateAllFeeds();
};

export default app;
