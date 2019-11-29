const { parse } = require('../number')

module.exports = {
  canParse: p => p.number !== undefined,
  parsePartial: ({ number }) => {
    const eq = parse(number)
    return {
      number: { eq }
    }
  }
}
