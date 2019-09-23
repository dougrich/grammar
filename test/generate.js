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

describe('Realistic NPC scenario + templates', () => {
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
      ],
      template: '{given-name} {surname}'
    },
    {
      is: ['nickname'],
      oneOf: [
        'Sticky Fingers',
        'The Butcher',
        'Longwatch'
      ]
    },
    {
      is: ['name/orc'],
      oneOf: [
        'Grok',
        'Nobb',
        'Arak',
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
        },
        {
          field: 'nickname',
          is: 'nickname'
        }
      ],
      template: '{given-name} "{nickname}" {surname}'
    },
    {
      is: ['race/human'],
      value: 'Human'
    },
    {
      is: ['npc/human'],
      has: [
        {
          field: 'name',
          is: 'name/human'
        },
        {
          field: 'race',
          is: 'race/human'
        }
      ]
    }
  ];

  [
    ['understands fuzzy', 'name', 0, 'Patrick McDonald'],
    ['picks one of', 'name', 0.999, 'Susan "Longwatch" Oswald'],
    ['complex nested', 'npc', 0, {
      race: 'Human',
      name: 'Patrick McDonald'
    }]
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

describe('Storage Assertions', () => {
  // load + offset + count
  // count
})

describe('#matchesIs', () => {
  [
    ['simple direct match', 'name', 'name', true],
    ['simple array match', 'name', ['name'], true],
    ['simple array-array match', ['name'], ['name'], true],
    ['realistic direct match', 'name', ['name/human'], true],
    ['realistic direct multiple match', 'place', ['place/oceanic', 'place/coastal'], true],
    ['realistic specific match', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/coastal'], true],
    ['realistic specific mismatch', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/deep'], false],
  ].forEach(([name, is, type, matches]) => {
    it(name, () => {
      expect(GrammarGenerator.matchesIs(is, type)).to.equal(matches)
    })
  })
})