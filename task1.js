'use strict';

const testObj = {
  1: 2,
  2: 'string',
  3: true,
  4: { a: 123 },
  5: ['1', '1', '1'],
  6: null,
  7: undefined,
  8: '',
  9: Symbol(''),
  10: new Date(),
  11: [new Set(), new Set()],
  12: new Set(),
  13: new Map(),
  true: 1,
  func: (val) => {
    console.log('first');
  },
  14: NaN,
  15: Infinity,
};

// testObj.ref = testObj;

function customStringify(value, replacer = null, space = null) {
  // От ошибки циклических ссылок
  const stringified = new Set();

  if (
    replacer !== null &&
    !Array.isArray(replacer) &&
    typeof replacer !== 'function'
  ) {
    throw new TypeError('Replacer must be an array or a function');
  }

  if (
    space !== null &&
    typeof space !== 'number' &&
    typeof space !== 'string'
  ) {
    throw new TypeError('Space must be a number or a string');
  }

  return stringify(value, replacer, space);

  function stringify(value, replacer = null, space = null) {
    switch (typeof value) {
      case 'number':
        if (isNaN(value) || !isFinite(value)) {
          return String(null);
        }
        return String(value);
      case 'boolean':
        return String(value);
      case 'string':
        return `"${value}"`;
      case 'symbol':
        return undefined;
      case 'bigint':
        return undefined;
      case 'undefined':
        return undefined;
      case 'function':
        return undefined;
      case 'object':
        if (value === null) {
          return String(value);
        }
        if (value instanceof Map) {
          return '{}';
        }
        if (value instanceof Set) {
          return '{}';
        }
        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }

        if (Array.isArray(value)) {
          const arrayString = value.map((item) => stringify(item, replacer));
          return `[${arrayString}]`;
        }

        // Работа с объектом

        // Space
        const indent =
          '' + (typeof space === 'number' ? ' '.repeat(space) : space || '');

        // От ошибки циклических ссылок
        if (stringified.has(value)) {
          console.log(stringified);
          console.log(value);
          throw new TypeError('Converting circular structure to JSON');
        }
        stringified.add(value);

        // Если replacer - функция
        function functionReplacer() {
          const objectString = Object.keys(value)
            .map((key) => {
              const replacedValue = replacer(key, value[key]);
              const stringifiedValue = stringify(replacedValue);
              if (stringifiedValue !== undefined) {
                return `${indent}"${key}":${stringifiedValue}`;
              }
            })
            .filter((item) => item !== undefined)
            .join(',');
          return `{${objectString}}`;
        }

        // Если replacer - массив
        function arrayReplacer() {
          const filteredValue = {};

          replacer.forEach((key) => {
            if (value.hasOwnProperty(key)) {
              filteredValue[key] = stringify(value[key], replacer);
            }
          });
          const objectString = Object.keys(filteredValue)
            .map((key) => {
              if (filteredValue[key] !== undefined) {
                return `${indent}"${key}":${filteredValue[key]}`;
              }
            })
            .filter((item) => item !== undefined)
            .join(',');
          return `{${objectString}}`;
        }

        if (replacer !== null) {
          if (typeof replacer === 'function') {
            return functionReplacer();
          } else {
            return arrayReplacer();
          }
        } else {
          const objectString = Object.keys(value)
            .map((key) => {
              const stringifiedValue = stringify(value[key]);
              if (stringifiedValue !== undefined) {
                return `${indent}"${key}":${stringifiedValue}`;
              }
            })
            .filter((item) => item !== undefined)
            .join(',');
          return `{${objectString}}`;
        }
    }
  }
}

console.log(JSON.stringify(testObj));
console.log(customStringify(testObj));
console.log(JSON.stringify(testObj) === customStringify(testObj));
