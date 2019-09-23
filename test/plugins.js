const { expect } = require('chai')

const GrammarGenerator = require('..')

describe('plugin', () => {
  const grammar = [
    {
      is: 'complex-type',
      complex: {
        field: 'value'
      }
    }
  ]
  const generator = new GrammarGenerator({
    storage: new GrammarGenerator.MemoryStorage(grammar),
    random: () => 0
  }, {
    canGenerateDry: (s) => !!s.complex,
    generateDry: (s, g) => s.complex.field
  })
  it('uses plugin#generateDry', async () => {
    expect(await generator.generate('complex-type')).to.eql('value')
  })
})