import onChange from 'on-change';

const render = (path, value) => {
  const input = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');

  if (path === 'form.valid') {
    if (value === null) {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else if (value) {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = 'RSS успешно загружен';
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
    // Рендерим фиды
    feedsContainer.innerHTML = ''; // Очищаем контейнер

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
    // Рендерим посты
    postsContainer.innerHTML = ''; // Очищаем контейнер

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
      const postItem = document.createElement('li');
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      postItem.innerHTML = `
        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="fw-bold">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      `;
      postsList.appendChild(postItem);
    });

    card.appendChild(cardBody);
    card.appendChild(postsList);
    postsContainer.appendChild(card);
  }
};

const initView = (state) => onChange(state, render);

export default initView;
