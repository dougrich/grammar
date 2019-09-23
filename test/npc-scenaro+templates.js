const { expect } = require('chai')

const GrammarGenerator = require('../')

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