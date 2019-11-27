const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('../')

describe('Deep + Succint', () => {
  const grammar = [
    {
      is: 'bottom',
      value: 'test'
    },
    {
      is: 'middle',
      has: 'bottom'
    },
    {
      is: 'top',
      has: 'middle'
    },
    {
      is: 'pinnacle',
      has: 'top'
    }
  ]
  const storage = new Storage(grammar);

  [
    ['understands fuzzy', 'pinnacle', { top: { middle: { bottom: 'test' } } }]
  ].forEach(([scenario, type, expected]) => {
    it(scenario, async () => {
      const { result } = await generate({ storage }, type)
      expect(result).to.eql(expected)
    })
  })
})
