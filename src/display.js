const list_join = (list) =>
  Array.isArray(list)
    ? `(${list.join(' ')})`
    : list;

module.exports = { list_join };
