const { expect } = require('./_chai')

const GrammarGenerator = require('../')

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
  ];

  [
    ['understands fuzzy', 'pinnacle', 0, { top: { middle: { bottom: 'test' } } }]
  ].forEach(([scenario, type, randomV, result]) => {
    it(scenario, async () => {
      const generator = new GrammarGenerator({
        storage: new GrammarGenerator.MemoryStorage(grammar),
        random: () => randomV
      })
      expect(await generator.generate(type)).to.eql(result)
    })
  })
})
