const arrayify = require('../util/arrayify')

function canGenerate (s) {
  return !!s.oneOf
}

function expand(s) {
  const oneOf = arrayify(s.oneOf)
  for (let i = 0; i < oneOf.length; i++) {
    let field = oneOf[i]
    if (typeof field === 'string') {
      oneOf[i] = { value: field }
    }
  }
  return {
    oneOf
  }
}

async function generate({ oneOf }, g) {
  const weights = oneOf.map(({ weight }) => weight || 1)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let which = Math.floor(g.random() * totalWeight)

  let i = 0
  while (i < weights.length) {
    if (which < weights[i]) {
      break
    } else {
      which -= weights[i]
    }
    i++
  }

  const result = oneOf[Math.min(i, weights.length)]
  return g.generate(result)
}

module.exports = {
  canGenerate,
  expand,
  generate
}