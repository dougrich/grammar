const arrayify = require('./arrayify')

function matchesIs (is, type) {
  is = arrayify(is)
  type = arrayify(type)

  for (let i = 0; i < is.length; i++) {
    let matches = false
    for (let j = 0; j < type.length; j++) {
      if (type[j].indexOf(is[i]) === 0) {
        // they match
        matches = true
        break
      }
    }
    if (!matches) return false
  }
  return true
}

module.exports = matchesIs