const { expect } = require('./_chai')
const toWeightedOptions = require('../dice')

describe('dice', () => {
  [
    [
      'simple 1d6',
      [1, 6],
      [
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    [
      '2d4',
      [2, 4],
      [
        1,
        2,
        3,
        4,
        3,
        2,
        1
      ]
    ],
    [
      '3d4',
      [3, 4],
      [
        1,
        3,
        6,
        10,
        12,
        12,
        10,
        6,
        3,
        1
      ]
    ],
    [
      '2d6',
      [2, 6],
      [
        1,
        2,
        3,
        4,
        5,
        6,
        5,
        4,
        3,
        2,
        1
      ]
    ]
  ].forEach(([name, [count, faces], result]) => {
    it(name, () => {
      expect(toWeightedOptions(count, faces)).to.eql(result)
    })
  })
})
