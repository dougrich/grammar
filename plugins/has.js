const arrayify = require('../util/arrayify')

function canGenerate (s) {
  return !!s.has
}

function expand(s) {
  const has = arrayify(s.has)
  for (let i = 0; i < has.length; i++) {
    let field = has[i]
    if (typeof field === 'string') {
      const [fieldname] = field.split('/', 1)
      has[i] = {
        field: fieldname,
        is: field
      }
    }
  }
  return {
    has
  }
}

async function generate({ has }, lexicon) {
  const result = { }
  for (const next of has) {
    result[next.field] = await lexicon.generate(next)
  }
  return result
}

module.exports = {
  canGenerate,
  expand,
  generate
}