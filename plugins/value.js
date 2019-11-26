module.exports = {
  canGenerate: s => !!s.value,
  generate: ({ value }) => value
}
