const fs = require('fs/promises');

async function parse() {
  const response = await fetch('https://www.anekdot.ru/random/anekdot/', {
    headers: {
      'Content-Type': 'text/html',
    },
  });

  const page = await response.text();

  const topicBox = new RegExp(
    /<div class="topicbox" id="\d+" data-id="-?\d+">.*?((<\/div>)(?=<\/div>))/,
    'gs'
  );

  const arr = page.match(topicBox).map((item) => {
    const id = item.match(/(?<=class="topicbox" id="\d+" data-id=")-?\d+/)[0];

    const text = item
      .match(/(?<=<div class="text">).*?(?=<\/div>)/s)[0]
      .replace(/<br>/g, '\n');

    const dateArr = item.match(/\d\d\.\d\d\.\d{4}/)[0].split('.');
    const date = new Date(`${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`);

    const rating = item.match(/\d+(?=;\d+;\d+;\d+")/)[0];

    const tagsMatch = item.match(/<div class="tags">.*?<\/div>/);
    const tags =
      tagsMatch !== null
        ? tagsMatch[0].match(/(?<=<a href=".*">).+?(?=<\/a>)/g)
        : [];

    const authorMatch = item.match(/(?<=<a class="auth".*?>).+?(?=<\/a>)/);
    const author = authorMatch !== null ? authorMatch[0] : null;

    return { id, text, date, rating, tags, author };
  });
  return arr;
}

parse().then((json) => fs.writeFile('result.json', JSON.stringify(json)));
