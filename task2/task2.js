const fs = require('fs/promises');
const HttpError = require('./errors');
const ParseError = require('./errors');
const JSONError = require('./errors');

async function getAneks(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

    if (!response.ok) {
      throw new HttpError(
        `Сетевая ошибка, статус ${response.status}`,
        response.statusText
      );
    }

    const page = await response.text();
    return page;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new HttpError(`Сетевая ошибка, неверный URL`, error.message);
    }
    throw error;
  }
}

async function parse(page) {
  try {
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
  } catch (error) {
    throw new ParseError('Ошибка разбора HTML', error.message);
  }
}

async function writeToJson(object) {
  try {
    const json = JSON.stringify(object);
    await fs.writeFile('result.json', json);
  } catch (error) {
    throw new JSONError('Ошибка сохранения', error.message);
  }
}

async function main() {
  try {
    const page = await getAneks('https://www.anekdot.ru/random/anekdot/');
    const res = await parse(page);
    await writeToJson(res);
  } catch (error) {
    console.log(error);
    const now = new Date().toLocaleString('ru-RU');
    const errStr = `${now} - ${error.name}
    CustomError: ${error.message}
    SystemError: ${error.systemMessage ?? error.stack}`;
    await fs.writeFile(`${now}.log`, errStr);
  }
}

main();
