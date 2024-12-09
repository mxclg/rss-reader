import onChange from 'on-change';

const createFeedItem = (feed) => {
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feed.title;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feed.description;

  feedItem.appendChild(title);
  feedItem.appendChild(description);

  return feedItem;
};

const renderFeeds = (feedsContainer, feeds) => {
  const container = feedsContainer;
  container.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = 'Фиды';
  cardBody.appendChild(feedsTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const feedItem = createFeedItem(feed);
    feedsList.appendChild(feedItem);
  });

  card.appendChild(cardBody);
  card.appendChild(feedsList);
  container.appendChild(card);
};

const renderFormValidation = (input, feedback, value, i18n) => {
  const inputElement = input;
  const feedbackElement = feedback;

  if (value === null) {
    inputElement.classList.remove('is-invalid');
    feedbackElement.textContent = '';
  } else if (value) {
    inputElement.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = i18n.t('validation.successRss');
    inputElement.value = '';
    inputElement.focus();
  } else {
    inputElement.classList.add('is-invalid');
  }
};

const generatePostElement = (post, isRead, i18n) => {
  const postItem = document.createElement('li');
  postItem.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );

  const link = document.createElement('a');
  link.href = post.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = isRead ? 'fw-normal link-secondary' : 'fw-bold';
  link.dataset.id = post.link;
  link.textContent = post.title;

  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.dataset.id = post.link;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = i18n.t('buttons.view');

  postItem.append(link, button);

  return postItem;
};

const renderPosts = (posts, readPosts, postsContainer, i18n) => {
  const container = postsContainer;
  container.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = 'Посты';
  cardBody.appendChild(postsTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const isRead = readPosts.includes(post.link);
    const postItem = generatePostElement(post, isRead, i18n);
    postsList.appendChild(postItem);
  });

  card.appendChild(cardBody);
  card.appendChild(postsList);
  container.appendChild(card);
};

const renderFormError = (feedback, value) => {
  const feedbackElement = feedback;
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.textContent = value;
};

const render = (path, value, state, i18n) => {
  const elements = {
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  switch (path) {
    case 'form.valid':
      renderFormValidation(elements.input, elements.feedback, value, i18n);
      break;

    case 'form.error':
      renderFormError(elements.feedback, value);
      break;

    case 'feeds':
      renderFeeds(elements.feedsContainer, value);
      break;

    case 'posts':
      renderPosts(value, state.ui.readPosts, elements.postsContainer, i18n);
      break;

    default:
      console.warn(`Неизвестный путь: ${path}`);
  }
};

const initView = (state, i18n) => onChange(
  state,
  (path, value) => render(path, value, state, i18n),
);

export default initView;
