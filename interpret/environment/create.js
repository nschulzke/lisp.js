const create = (parent = {}) => ({
  '__parent__': parent,
});

module.exports = create;
