const { expect } = require('./_chai')

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
    canGenerate: (s) => !!s.complex,
    generate: (s, g) => s.complex.field
  })
  it('uses plugin#generate', async () => {
    expect(await generator.generate('complex-type')).to.eql('value')
  })
})
