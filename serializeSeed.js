const seperator = '-'
const prefix = 'seed@'

function toSeed (array) {
  return prefix + array.map(i => i.toString(16)).join(seperator)
}

function fromSeed (seed) {
  return seed.slice(prefix.length).split(seperator).map(s => parseInt(s, 16))
}

module.exports = {
  toSeed,
  fromSeed
}
