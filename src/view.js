import onChange from 'on-change';

const render = (path, value, state, i18n) => {
  const input = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');

  if (path === 'ui.readPosts') {
   render('posts', state.posts, state, i18n);
   return;
}

  if (path === 'form.valid') {
    if (value === null) {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else if (value) {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('validation.successRss');
      input.value = '';
      input.focus();
    } else {
      input.classList.add('is-invalid');
    }
  }

  if (path === 'form.error' && value) {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = value;
  }

  if (path === 'feeds') {
    feedsContainer.innerHTML = '';

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

    value.forEach((feed) => {
      const feedItem = document.createElement('li');
      feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedItem.innerHTML = `
        <h3 class="h6 m-0">${feed.title}</h3>
        <p class="m-0 small text-black-50">${feed.description}</p>
      `;
      feedsList.appendChild(feedItem);
    });

    card.appendChild(cardBody);
    card.appendChild(feedsList);
    feedsContainer.appendChild(card);
  }

  if (path === 'posts') {
    postsContainer.innerHTML = '';

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

    value.forEach((post) => {
      const isChecked = state.ui.readPosts.includes(post.link);
      const postClass = isChecked ? 'fw-normal link-secondary' : 'fw-bold';
      const postItem = document.createElement('li');
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      postItem.innerHTML = `
        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="${postClass}" data-id="${post.link}">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.link}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttons.view')}</button>
      `;
      postsList.appendChild(postItem);
    });

    card.appendChild(cardBody);
    card.appendChild(postsList);
    postsContainer.appendChild(card);
  }

  if (path === 'ui.readPosts') {
    const { posts } = state;
    postsContainer.innerHTML = '';

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
      const isChecked = state.ui.readPosts.includes(post.link);
      const postClass = isChecked ? 'fw-normal' : 'fw-bold';

      const postItem = document.createElement('li');
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      postItem.innerHTML = `
       <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="${postClass}" data-id="${post.link}">${post.title}</a>
       <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.link}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttons.view')}</button>
     `;
      postsList.appendChild(postItem);
    });

    card.appendChild(cardBody);
    card.appendChild(postsList);
    postsContainer.appendChild(card);
  }

  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (id) {
      const post = state.posts.find((p) => p.link === id);
      if (post) {
        modalTitle.textContent = post.title;
        modalBody.textContent = post.description;
        modalLink.href = post.link;

        if (!state.ui.readPosts.includes(id)) {
          state.ui.readPosts.push(id);
        }
      }
    }
  });
};

const initView = (state, i18n) => onChange(
  state,
  (path, value) => render(path, value, state, i18n),
);
export default initView;
