const { expect } = require('./_chai')
const DecisionTree = require('../decisionTree')

const EasyDecision = {
  distribution: {
    weights: [
      1,
      1
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
      1,
      1
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

const ContextualDecision = (color) => {
  return ({
    children: {
      color: { value: color },
      auxilary: {
        dependsOn: ['../color'],
        distribution: {
          matrix: {
            inputs: [
              { lookup: '../color', eq: 'red' },
              { lookup: '../color', eq: 'blue' },
              { lookup: '../color', eq: 'green' },
              0
            ],
            values: [
              [1, 0, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 1, 0],
              [0, 0, 0, 0]
            ]
          }
        },
        options: [
          { value: 'pink' },
          { value: 'periwinkle' },
          { value: 'lime' },
          { value: 'black' }
        ]
      }
    }
  })
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
      [0, 0, 0, 0, 0, 0, 0, 0],
      {
        decisionVector: [0, 0, 0, 0, 0, 0, 0, 0],
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
      [0, 0],
      {
        decisionVector: [0, 0],
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
    ],
    [
      'Contextual red',
      ContextualDecision('red'),
      [0],
      {
        decisionVector: [0],
        result: {
          color: 'red',
          auxilary: 'pink'
        }
      }
    ],
    [
      'Contextual blue',
      ContextualDecision('blue'),
      [0],
      {
        decisionVector: [1],
        result: {
          color: 'blue',
          auxilary: 'periwinkle'
        }
      }
    ],
    [
      'Contextual green',
      ContextualDecision('green'),
      [0],
      {
        decisionVector: [2],
        result: {
          color: 'green',
          auxilary: 'lime'
        }
      }
    ],
    [
      'Contextual else',
      ContextualDecision('purple'),
      [0],
      {
        decisionVector: [3],
        result: {
          color: 'purple',
          auxilary: 'black'
        }
      }
    ],
    [
      'Numeric Decision',
      {
        children: {
          str: { value: 1 },
          droll: {
            dependsOn: ['../str'],
            number: {
              inputs: {
                str: { lookup: '../str' }
              },
              eq: { args: [{ args: [1, 6], op: 'd' }, { arg: 'str' }], op: '+' }
            }
          }
        }
      },
      [0],
      {
        decisionVector: [0],
        result: {
          str: 1,
          droll: 2
        }
      }
    ],
    [
      'Numeric Decision',
      {
        children: {
          droll: {
            number: {
              eq: { args: [{ args: [1, 6], op: 'd' }, 2], op: '+' }
            }
          }
        }
      },
      [0],
      {
        decisionVector: [0],
        result: {
          droll: 3
        }
      }
    ],
    [
      'absolute someOf decision',
      {
        repeat: {
          count: { eq: 2 },
          instance: {
            distribution: {
              weights: [
                1,
                1,
                1,
                1,
                1,
                1
              ]
            },
            options: [
              { value: 'test 0' },
              { value: 'test 1' },
              { value: 'test 2' },
              { value: 'test 3' },
              { value: 'test 4' },
              { value: 'test 5' }
            ]
          }
        }
      },
      [0, 0.999],
      {
        decisionVector: [0, 5],
        result: [
          'test 0',
          'test 5'
        ]
      }
    ],
    [
      'dynamic someOf decision',
      {
        repeat: {
          count: { eq: { op: 'd', args: [1, 4] } },
          instance: {
            distribution: {
              weights: [
                1,
                1,
                1,
                1,
                1,
                1
              ]
            },
            options: [
              { value: 'test 0' },
              { value: 'test 1' },
              { value: 'test 2' },
              { value: 'test 3' },
              { value: 'test 4' },
              { value: 'test 5' }
            ]
          }
        }
      },
      [0.999, 0, 0, 0, 0],
      {
        decisionVector: [3, 0, 0, 0, 0],
        result: [
          'test 0',
          'test 0',
          'test 0',
          'test 0'
        ]
      }
    ],
    [
      'referenced someOf decision',
      {
        children: {
          count: {
            number: {
              eq: { args: [1, 4], op: 'd' }
            }
          },
          list: {
            repeat: {
              count: { eq: { arg: 'str' }, inputs: { str: { lookup: '../count' } } },
              instance: {
                distribution: {
                  weights: [
                    1,
                    1,
                    1,
                    1,
                    1,
                    1
                  ]
                },
                options: [
                  { value: 'test 0' },
                  { value: 'test 1' },
                  { value: 'test 2' },
                  { value: 'test 3' },
                  { value: 'test 4' },
                  { value: 'test 5' }
                ]
              }
            }
          }
        }
      },
      [0.999, 0, 0, 0, 0],
      {
        decisionVector: [3, 0, 0, 0, 0],
        result: {
          count: 4,
          list: [
            'test 0',
            'test 0',
            'test 0',
            'test 0'
          ]
        }
      }
    ]
  ]

  describe('#collapse', () => {
    scenarios.forEach(([name, tree, randomVSequence, expected]) => {
      it(name, () => {
        let i = 0
        const random = () => randomVSequence[i++]
        const engine = new DecisionTree({ random })
        expect(engine.collapse(tree)).to.eql(expected)
      })
    })
  })

  describe('#hydrate', () => {
    scenarios.forEach(([name, tree, randomVSequence, expected]) => {
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
    ].forEach(([name, tree, decisionVector, rerollPath, randomVSequence, expected]) => {
      it(name, () => {
        let i = 0
        const random = () => randomVSequence[i++]
        const engine = new DecisionTree({ random })
        expect(engine.reroll(tree, decisionVector, rerollPath)).to.eql(expected)
      })
    })
  })

  describe('#applyTemplate', () => {
    [
      [
        'simple no sub',
        ['getting templated'],
        {},
        '/test',
        { test: 'getting templated' }
      ],
      [
        'simple with sub',
        ['getting templated and ', { lookup: '/subbed' }],
        { subbed: 'substituted' },
        '/test',
        { test: 'getting templated and substituted' }
      ],
      [
        'simple with each',
        ['getting templated and ', { lookup: '/subbed', each: ['repeat ', { lookup: '/' }, ' '] }],
        { subbed: [0, 1, 2] },
        '/test',
        { test: 'getting templated and repeat 0 repeat 1 repeat 2 ' }
      ]
    ].forEach(([name, template, value, pointer, output]) => {
      it(name, () => {
        const random = () => Math.random()
        const context = {}
        const engine = new DecisionTree({ random })
        engine.applyTemplate(template, value, pointer, context)()
        expect(context).to.eql(output)
      })
    })
  })
})
