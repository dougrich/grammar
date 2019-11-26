const { expect } = require('./_chai')

const GrammarGenerator = require('..')

describe('GrammarGenerator#expand', () => {
  [
    [
      'simple is/has combo',
      {
        is: 'testcase',
        has: 'name/testcase'
      },
      {
        is: ['testcase'],
        has: [
          { field: 'name', is: 'name/testcase' }
        ]
      }
    ],
    [
      'simple oneOf case',
      {
        is: 'testcase',
        oneOf: 'simple'
      },
      {
        is: ['testcase'],
        oneOf: [
          { value: 'simple' }
        ]
      }
    ]
  ].forEach(([name, input, expectedOutput]) => {
    it(name, () => {
      const generator = new GrammarGenerator({
        storage: null,
        random: null
      })
      expect(generator.expand(input)).to.eql(expectedOutput)
    })
  })
})
