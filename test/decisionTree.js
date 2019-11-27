const { expect } = require('./_chai')
const DecisionTree = require('../decisionTree')

const EasyDecision = {
  distribution: {
    weights: [
      { absolute: 1 },
      { absolute: 1 }
    ]
  },
  options: [
    { value: 'test 0' },
    { value: 'test 1' }
  ]
}

const NestedDecision = {
  children: {
    testA: EasyDecision,
    testB: EasyDecision
  }
}

const DeeplyNestedDecision = {
  children: {
    testA: EasyDecision,
    testB: {
      children: {
        testA: EasyDecision,
        testB: NestedDecision
      }
    }
  }
}

const BranchingDecision = {
  children: {
    left: DeeplyNestedDecision,
    right: DeeplyNestedDecision
  }
}

const NestedEasyDecision = {
  distribution: {
    weights: [
      { absolute: 1 },
      { absolute: 1 }
    ]
  },
  options: [
    {
      children: {
        name: EasyDecision
      }
    },
    {
      children: {
        test: EasyDecision
      }
    }
  ]
}

const TemplatedDecision = {
  children: {
    left: EasyDecision
  },
  $template: [
    'this is a ',
    { lookup: '/left' },
    ' decision'
  ]
}

describe('DecisionTree', () => {

  const scenarios = [
    [
      'simple case',
      EasyDecision,
      [0],
      {
        decisionVector: [0],
        result: 'test 0'
      }
    ],
    [
      'nested',
      NestedDecision,
      [0, 0.9999],
      {
        decisionVector: [0, 1],
        result: {
          testA: 'test 0',
          testB: 'test 1'
        }
      }
    ],
    [
      'deeply nested',
      DeeplyNestedDecision,
      [0, 0, 0, 0],
      {
        decisionVector: [0, 0, 0, 0],
        result: {
          testA: 'test 0',
          testB: {
            testA: 'test 0',
            testB: {
              testA: 'test 0',
              testB: 'test 0'
            }
          }
        }
      }
    ],
    [
      'branching',
      BranchingDecision,
      [0,0,0,0,0,0,0,0],
      {
        decisionVector: [0,0,0,0,0,0,0,0],
        result: {
          left: {
            testA: 'test 0',
            testB: {
              testA: 'test 0',
              testB: {
                testA: 'test 0',
                testB: 'test 0'
              }
            }
          },
          right: {
            testA: 'test 0',
            testB: {
              testA: 'test 0',
              testB: {
                testA: 'test 0',
                testB: 'test 0'
              }
            }
          }
        }
      }
    ],
    [
      'nested easy',
      NestedEasyDecision,
      [0,0],
      {
        decisionVector: [0,0],
        result: {
          name: 'test 0'
        }
      }
    ],
    [
      'templated',
      TemplatedDecision,
      [0],
      {
        decisionVector: [0],
        result: 'this is a test 0 decision'
      }
    ]
  ]

  describe('#collapse', () => {
    scenarios.forEach(([ name, tree, randomVSequence, expected ]) => {
      it(name, () => {
        let i = 0
        const random = () => randomVSequence[i++]
        const engine = new DecisionTree({ random })
        expect(engine.collapse(tree)).to.eql(expected)
      })
    })
  })

  describe('#hydrate', () => {
    scenarios.forEach(([ name, tree, randomVSequence, expected ]) => {
      it(name, () => {
        const engine = new DecisionTree()
        expect(engine.hydrate(tree, expected.decisionVector)).to.eql(expected.result)
      })
    })
  })

  describe('#reroll', () => {
    [
      [
        'after name decision',
        NestedEasyDecision,
        [0, 0],
        '/name',
        [0.999],
        {
          decisionVector: [0, 1],
          result: {
            name: 'test 1'
          }
        }
      ]
    ].forEach(([ name, tree, decisionVector, rerollPath, randomVSequence, expected ]) => {
      it(name, () => {
        let i = 0
        const random = () => randomVSequence[i++]
        const engine = new DecisionTree({ random })
        expect(engine.reroll(tree, decisionVector, rerollPath)).to.eql(expected)
      })
    })
  })

})