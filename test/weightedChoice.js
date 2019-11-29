const { expect } = require('./_chai')
const weightedChoice = require('../weightedChoice')

describe('weightedChoice', () => {
  [
    [
      '3/5 - lower upper',
      [1,3,1],
      0.21,
      1
    ],
    [
      '3/5 - lower lower',
      [1,3,1],
      0.19,
      0
    ],
    [
      '3/5 - upper lower',
      [1,3,1],
      0.79,
      1
    ],
    [
      '3/5 - upper upper',
      [1,3,1],
      0.81,
      2
    ]
  ].forEach(([ name, weights, randomV, result ]) => {
    it(name, () => {
      expect(weightedChoice(weights, randomV)).to.eql(result)
    })
  })
})