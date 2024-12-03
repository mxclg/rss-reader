const parseRSS = (rssString) => {
  const parser = new DOMParser(); // Создаем новый парсер
  const doc = parser.parseFromString(rssString, 'application/xml'); // Парсим строку как XML

  // Проверяем на наличие ошибок парсинга
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('validation.rssError'); // Генерируем ошибку, если RSS некорректный
  }

  // Извлекаем данные о фиде
  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;

  // Извлекаем данные о постах
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description')?.textContent || 'Описание недоступно.',
  }));

  return { feed: { title, description }, posts }; // Возвращаем объект с фидом и постами
};

export default parseRSS;
