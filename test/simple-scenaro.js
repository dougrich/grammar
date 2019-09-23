const { expect } = require('chai')

const GrammarGenerator = require('../')

describe('Simple scenario', () => {
  const grammar = [
    {
      is: ['given-name/human'],
      oneOf: [
        'Patrick',
        'Patricia',
        'Mark',
        'Maria',
        'Stewart',
        'Susan'
      ]
    },
    {
      is: ['surname/human'],
      oneOf: [
        'McDonald',
        'Trudeau',
        'Oswald'
      ]
    },
    {
      is: ['name/human'],
      has: [
        {
          field: 'given-name',
          is: 'given-name/human'
        },
        {
          field: 'surname',
          is: 'surname/human'
        }
      ]
    }
  ]

  const generator = new GrammarGenerator({
    storage: new GrammarGenerator.MemoryStorage(grammar),
    random: () => 0
  })

  it('generates a step', async () => {
    expect(await generator.generateDry('name/human')).to.eql({
      'is': ['name/human'],
      'given-name': { 'is': 'given-name/human' },
      'surname': { 'is': 'surname/human' }
    })
  })

  it('hydrates a step', async () => {
    expect(await generator.hydrate({
      'is': ['name/human'],
      'given-name': { 'is': 'given-name/human' },
      'surname': { 'is': 'surname/human' }
    })).to.eql({
      'given-name': 'Patrick',
      'surname': 'McDonald'
    })
  })

  it('re-rolls missing fields with type hinting', async () => {
    expect(await generator.hydrate({
      'is': ['name/human'],
      'given-name': 'Davis'
    })).to.eql({
      'given-name': 'Davis',
      'surname': 'McDonald'
    })
  })
})