const token = /(\(|\)|"[^"]*"|[^\s()]+)/g;

const tokenize = (string) =>
  string.match(token);

module.exports = tokenize;
