const { expect } = require('./_chai')
const { parse, evaluate } = require('../number')

describe('number', () => {
  const scenarios = [
    [
      'simple addition',
      '1d6 + 5',
      { args: [{ args: [1, 6], op: 'd' }, 5], op: '+' },
      0,
      {},
      6
    ],
    [
      'simple subtraction',
      '1d6 - 5',
      { args: [{ args: [1, 6], op: 'd' }, 5], op: '-' },
      0,
      {},
      -4
    ],
    [
      'simple argument',
      '6 + {str}',
      { args: [6, { arg: 'str' }], op: '+' },
      0,
      { str: 2 },
      8
    ]
  ]

  describe('#parse', () => {
    scenarios.forEach(([name, inputPhrase, parsed]) => {
      it.only(name, () => {
        expect(parse(inputPhrase)).to.eql(parsed)
      })
    })
  })

  describe('#evalute', () => {
    scenarios.forEach(([name, _, parsed, randomV, args, result]) => {
      it.only(name, () => {
        const random = (min, max) => randomV * (max - min) + min
        expect(evaluate(parsed, random, args)).to.eql(result)
      })
    })
  })
})