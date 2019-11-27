module.exports = {
  canParse: p => p.value !== undefined,
  parsePartial: ({ value }) => ({ value })
}
