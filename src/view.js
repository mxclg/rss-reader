import onChange from 'on-change';

const render = (path, value) => {
  const input = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');

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
};

const initView = (state) => onChange(state, render);

export default initView;
