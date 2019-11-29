const { expect } = require('./_chai')
const Parser = require('../parser')
const Storage = require('./_memory-storage')

describe('Parser#parsePartial', () => {
  const grammar = [
    {
      is: 'name/testcase-0',
      value: 'tested-0'
    },
    {
      is: 'name/testcase-1',
      value: 'tested-1'
    },
    {
      is: ['container/simple', 'obj/simple'],
      has: 'name'
    },
    {
      is: 'obj/flat',
      has: [
        { field: 'idea', value: 'cool' }
      ]
    },
    {
      is: 'container/complex',
      has: 'obj'
    },
    {
      is: 'leaf/nested',
      has: [
        { field: 'input', value: 'done' }
      ],
      template: 'this is a {input} deal'
    },
    {
      is: 'container/nested',
      has: 'leaf/nested'
    }
  ];

  const storage = new Storage(grammar);

  describe('#parsePartial', () => {
    [
      [
        'simple expansion',
        'name',
        {
          distribution: {
            weights: [
              1,
              1
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': grammar[0].id,
            '/options/1': grammar[1].id
          }
        }
      ],
      [
        'simple leaf',
        'name/testcase-0',
        { value: 'tested-0' }
      ],
      [
        'simple container',
        'container/simple',
        {
          children: {
            name: null
          },
          $ref: {
            '/children/name': { is: 'name' }
          }
        }
      ],
      [
        'complex container',
        'container/complex',
        {
          children: {
            obj: null
          },
          $ref: {
            '/children/obj': { is: 'obj' }
          }
        }
      ],
      [
        'obj',
        'obj',
        {
          distribution: {
            weights: [
              1,
              1
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': grammar[2].id,
            '/options/1': grammar[3].id
          }
        }
      ],
      [
        'leaf/nested',
        'leaf/nested',
        {
          children: {
            input: null
          },
          $ref: {
            '/children/input': { value: 'done' }
          },
          $template: [
            'this is a ',
            { lookup: '/input' },
            ' deal'
          ]
        }
      ]
    ].forEach(([name, input, output]) => {
      it(name, async () => {
        const generator = new Parser({ storage })
        expect(await generator.parsePartial(input)).to.eql(output)
      })
    })
  })

  describe('#parse', () => {
    [
      [
        'simple expansion',
        'name',
        {
          distribution: {
            weights: [
              1,
              1
            ]
          },
          options: [
            { value: 'tested-0' },
            { value: 'tested-1' }
          ]
        }
      ],
      [
        'simple container',
        'container/simple',
        {
          children: {
            name: {
              distribution: {
                weights: [
                  1,
                  1
                ]
              },
              options: [
                { value: 'tested-0' },
                { value: 'tested-1' }
              ]
            }
          }
        }
      ],
      [
        'complex container',
        'container/complex',
        {
          children: {
            obj: {
              distribution: {
                weights: [
                  1,
                  1
                ]
              },
              options: [
                {
                  children: {
                    name: {
                      distribution: {
                        weights: [
                          1,
                          1
                        ]
                      },
                      options: [
                        { value: 'tested-0' },
                        { value: 'tested-1' }
                      ]
                    }
                  }
                },
                {
                  children: {
                    idea: { value: 'cool' }
                  }
                }
              ]
            }
          }
        }
      ],
      [
        'preserves special fields',
        'container/nested',
        {
          children: {
            leaf: {
              children: {
                input: { value: 'done' }
              },
              $template: [
                'this is a ',
                { lookup: '/input' },
                ' deal'
              ]
            }
          }
        }
      ]
    ].forEach(([name, input, output]) => {
      it(name, async () => {
        const generator = new Parser({ storage })
        expect(await generator.parse(input)).to.eql(output)
      })
    })
  })
})