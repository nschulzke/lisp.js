const atom = (token) =>
  isNaN(token)
    ? token
    : Number(token);

const parse = (tokens) => {
  if (!Array.isArray(tokens))
    throw Error('Unexpected input to parser');
  if (tokens.length === 0)
    throw Error('Unexpected EOF');

  let list = [];
  let token = tokens.shift();
  while (token !== ')' && token !== undefined) {
    if (token === '(') {
      list.push(parse(tokens));
    } else {
      list.push(atom(token));
    }
    token = tokens.shift();
  }
  while (list.length === 1 && Array.isArray(list[0])) {
    list = list[0];
  }
  return list;
};

module.exports = parse;
