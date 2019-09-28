const arrayify = require('../util/arrayify')

function simplify(value) {
  if (typeof value === 'string') {
    const [field] = value.split('/', 1)
    return {
      field,
      is: value
    }
  }

  return value
}

function canGenerate (s) {
  return !!s.has
}

async function generate({ is, has }, lexicon) {
  const result = { }
  for (const { field, is } of arrayify(has).map(simplify)) {
    result[field] = await lexicon.generate(is)
  }
  return result
}

module.exports = {
  canGenerate,
  generate
}