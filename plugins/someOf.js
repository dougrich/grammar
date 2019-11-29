const { parse } = require('../number')

module.exports = {
  canParse: p => p.someOf !== undefined,
  parsePartial: ({ someOf: { count, each } }) => {
    if (typeof each === 'string') {
      each = { is: each }
    }
    return {
      repeat: {
        count: { eq: parse(count) },
        instance: null
      },
      $ref: {
        '/repeat/instance': each
      }
    }
  }
}
