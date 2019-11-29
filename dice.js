/**
 * Specific handling for dice
 * This is done so that the number of decisions does not increase with the number of dice you roll
 * For example: rolling 2d6 naively (rand(1,6) + rand(1, 6)) results in two decisions being made
 * 4d6, for example, would require 4 separate decisions
 * It should behave like a single decision with weighted results
 * 95% of applications are better using the rand(1,6) method, but this would have some interesting applications if your random number generator was really slow, for example
 */

function toWeightedOptions(count, faces) {
  // recursively expand for each count
  let previousResults = new Array(faces)
  previousResults.fill(1)
  for (let i = 0; i < count - 1; i++) {
    let nextResults = new Array(previousResults.length + faces)
    for (let j = i; j < nextResults.length; j++) {
      let sum = 0
      for (let k = -faces; k < 0; k++) {
        let pi = j + k
        if (pi >= 0 && pi < previousResults.length) {
          sum += previousResults[pi]
        }
      }
      nextResults[j] = sum
    }
    previousResults = nextResults
  }
  return previousResults.slice(count - 1, faces * count)
}

module.exports = toWeightedOptions