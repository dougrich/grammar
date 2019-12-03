const { expect } = require('./_chai')
const parseTemplate = require('../util/parseTemplate')

describe('#parseTemplate', () => {
  [
    [
      'simple',
      'get {test} with it',
      [
        'get ',
        { lookup: '/test' },
        ' with it'
      ]
    ],
    [
      'nested',
      'get {test/neato} with it',
      [
        'get ',
        { lookup: '/test/neato' },
        ' with it'
      ]
    ],
    [
      'array',
      'get {#each test/neato}{.}{/each} with it',
      [
        'get ',
        {
          lookup: '/test/neato',
          each: [
            { lookup: '/' }
          ]
        },
        ' with it'
      ]
    ],
    [
      'deep multiple array',
      'get {#each test/neato}{#each edge}{.}{/each}{/each} with it',
      [
        'get ',
        {
          lookup: '/test/neato',
          each: [
            {
              lookup: '/edge',
              each: [
                { lookup: '/' }
              ]
            }
          ]
        },
        ' with it'
      ]
    ]
  ].forEach(([name, input, output]) => {
    it(name, () => {
      expect(parseTemplate(input)).to.eql(output)
    })
  })
  describe('#tokenize', () => {
    [
      [
        'simple',
        'get {test} with it',
        ['get ', '{test}', ' with it']
      ],
      [
        'escaped',
        'get \\{test\\} with it',
        ['get {test} with it']
      ],
      [
        'hash item',
        '{#each test/neato}{.}{/each}',
        ['{#each test/neato}', '{.}', '{/each}']
      ]
    ].forEach(([name, input, output]) => {
      it(name, () => {
        expect(parseTemplate.tokenize(input)).to.eql(output)
      })
    })
  })
})
