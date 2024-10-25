import onChange from 'on-change';

// Функция для обновления интерфейса при изменениях состояния
const render = (path, value) => {
  const input = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');

  if (path === 'form.valid' && value) {
    input.classList.remove('is-invalid');
    input.value = '';
    input.focus();
  }

  if (path === 'form.error' && value) {
    input.classList.add('is-invalid');
    feedback.textContent = value;
  }
};

// Функция оборачивает состояние в on-change и возвращает отслеживаемое состояние
const initView = (state) => onChange(state, render);

export default initView;