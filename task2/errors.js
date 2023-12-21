module.exports = class HttpError extends Error {
  constructor(message, statusText) {
    super(message);
    this.name = 'HttpError';
    this.systemMessage = statusText;
  }
};
module.exports = class ParseError extends Error {
  constructor(message, systemMessage) {
    super(message);
    this.name = 'ParseError';
    this.systemMessage = systemMessage;
  }
};
module.exports = class JSONError extends Error {
  constructor(message, systemMessage) {
    super(message);
    this.name = 'JSONError';
    this.systemMessage = systemMessage;
  }
};
