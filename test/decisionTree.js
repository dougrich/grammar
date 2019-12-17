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
        result: 'test 0',
        steps: 2
      }
    ],
    [
      'nested',
      NestedDecision,
      [0, 0.9999],
      {
        decisionVector: [0, 255],
        result: {
          testA: 'test 0',
          testB: 'test 1'
        },
        steps: 5
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
        },
        steps: 11
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
        },
        steps: 23
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
        },
        steps: 4
      }
    ],
    [
      'templated',
      TemplatedDecision,
      [0],
      {
        decisionVector: [0],
        result: 'this is a test 0 decision',
        steps: 3
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
        },
        steps: 5
      }
    ],
    [
      'Contextual blue',
      ContextualDecision('blue'),
      [0],
      {
        decisionVector: [0],
        result: {
          color: 'blue',
          auxilary: 'periwinkle'
        },
        steps: 5
      }
    ],
    [
      'Contextual green',
      ContextualDecision('green'),
      [0],
      {
        decisionVector: [0],
        result: {
          color: 'green',
          auxilary: 'lime'
        },
        steps: 5
      }
    ],
    [
      'Contextual else',
      ContextualDecision('purple'),
      [0],
      {
        decisionVector: [0],
        result: {
          color: 'purple',
          auxilary: 'black'
        },
        steps: 5
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
        },
        steps: 4
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
        },
        steps: 2
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
        decisionVector: [0, 255],
        result: [
          'test 0',
          'test 5'
        ],
        steps: 5
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
        decisionVector: [255, 0, 0, 0, 0],
        result: [
          'test 0',
          'test 0',
          'test 0',
          'test 0'
        ],
        steps: 9
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
        decisionVector: [255, 0, 0, 0, 0],
        result: {
          count: 4,
          list: [
            'test 0',
            'test 0',
            'test 0',
            'test 0'
          ]
        },
        steps: 11
      }
    ],
    [
      'multiple nested templates with out of order execution',
      {
        children: {
          left: {
            children: {
              example: { value: 'a' }
            },
            $template: [{ lookup: '/example' }]
          },
          right: {
            children: {
              example: { value: 'a' }
            },
            $template: [{ lookup: '/example' }]
          }
        },
        $template: [
          { lookup: '/left' },
          { lookup: '/right' }
        ]
      },
      [],
      {
        decisionVector: [],
        result: 'aa',
        steps: 5
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
          decisionVector: [0, 255],
          result: {
            name: 'test 1'
          },
          steps: 4
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
        'getting templated'
      ],
      [
        'simple with sub',
        ['getting templated and ', { lookup: '/subbed' }],
        { subbed: 'substituted' },
        'getting templated and substituted'
      ],
      [
        'simple with each',
        ['getting templated and ', { lookup: '/subbed', each: ['repeat ', { lookup: '/' }, ' '] }],
        { subbed: [0, 1, 2] },
        'getting templated and repeat 0 repeat 1 repeat 2 '
      ]
    ].forEach(([name, template, value, output]) => {
      it(name, () => {
        const random = () => Math.random()
        const engine = new DecisionTree({ random })
        expect(engine.applyTemplate(template, value)).to.eql(output)
      })
    })
  })
})
