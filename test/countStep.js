const { expect } = require('./_chai')
const countStep = require('../countStep')

describe('#countStep', () => {
  /**
   * should count the number of decisions & times a decision is expanded
   * this is roughly the 'cost' of generating a thing
   */
  [
    [
      'simple',
      {
        value: 'test'
      },
      1
    ],
    [
      'children',
      {
        children: {
          left: { value: 'test' },
          right: { value: 'test' }
        }
      },
      3
    ],
    [
      'oneOf',
      {
        distribution: {
          weights: [
            1,
            1
          ]
        },
        options: [
          { value: 'test' },
          { value: 'test' }
        ]
      },
      3
    ],
    [
      'someOf',
      {
        repeat: {
          count: { eq: { op: 'd', args: [2, 6] } },
          instance: { value: 'test' }
        }
      },
      13
    ]
  ].forEach(([name, tree, expected]) => {
    it(name, () => {
      expect(countStep(tree)).to.eql(expected)
    })
  })
})
