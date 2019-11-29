function weightedChoice(weights, randomValue) {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i]
  }
  let which = randomValue * sum
  let i = 0
  while (i < weights.length) {
    if (which < weights[i]) {
      break
    } else {
      which -= weights[i]
    }
    i++
  }
  return Math.min(weights.length - 1, i)
}

module.exports = weightedChoice