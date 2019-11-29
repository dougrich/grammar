const arrayify = require('../util/arrayify')

function canParse (s) {
  return !!s.oneOf
}

function parsePartial (s) {
  const oneOf = arrayify(s.oneOf)
  if (oneOf.length === 1) {
    if (typeof oneOf[0] !== 'object') {
      return { value: oneOf[0] }
    } else {
      return oneOf[0]
    }
  }

  const weights = new Array(oneOf.length)
  const options = new Array(oneOf.length)
  options.fill(null)
  let $ref = {}

  for (let i = 0; i < oneOf.length; i++) {
    let option = oneOf[i]
    weights[i] = option.weight || 1
    if (typeof option !== 'object') {
      option = { is: option }
    }
    option = Object.assign({}, option)
    delete option.weight
    $ref['/options/' + i] = option
  }


  return {
    distribution: {
      weights
    },
    options,
    $ref
  }
}

module.exports = {
  canParse,
  parsePartial
}
