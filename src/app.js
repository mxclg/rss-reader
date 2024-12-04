import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import initView from './view.js';
import fetchRSS from './fetchRSS.js';
import parseRSS from './parse.js';

const app = async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'ru',
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

  const markPostAsRead = (postId) => {
    if (!watchedState.ui.readPosts.includes(postId)) {
      watchedState.ui.readPosts.push(postId);
    }
  };

  const postsContainer = document.querySelector('.posts');

  postsContainer.addEventListener('click', (event) => {
    const { target } = event;

    if (target.tagName === 'A') {
      const postId = target.dataset.id;
      markPostAsRead(postId);
    }

    if (target.tagName === 'BUTTON' && target.dataset.bsToggle === 'modal') {
      const postId = target.dataset.id;
      markPostAsRead(postId);
    }
  });

  const form = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');

  const schema = yup.string().trim().required().url();

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

            watchedState.feeds.push({ ...feed, url: validUrl });

            posts.forEach((post) => {
              watchedState.posts.push({ ...post, feedUrl: validUrl });
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

  const updateFeeds = () => {
    if (watchedState.feeds.length === 0) {
      setTimeout(updateFeeds, 5000);
      return;
    }

    const promises = watchedState.feeds.map((feed) => fetchRSS(feed.url)
      .then((rssContent) => {
        const { posts } = parseRSS(rssContent);

        const existingLinks = watchedState.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !existingLinks.includes(post.link));

        newPosts.forEach((post) => {
          const isRead = watchedState.ui.readPosts.includes(post.link);
          watchedState.posts.push({ ...post, feedUrl: feed.url, isRead });
        });
      })
      .catch((error) => {
        console.error(`Ошибка обновления фида ${feed.url}:`, error);
        watchedState.form.error = `Ошибка обновления фида: ${feed.url}`;
      }));

    Promise.all(promises).finally(() => {
      setTimeout(updateFeeds, 5000);
    });
  };

  updateFeeds();
};

export default app;
