const parseRSS = (rssString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssString, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('validation.rssError');
  }

  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;

  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description')?.textContent || 'Описание недоступно.',
  }));

  return { feed: { title, description }, posts };
};

export default parseRSS;
