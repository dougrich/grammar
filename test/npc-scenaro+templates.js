const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('../')

describe('Realistic NPC scenario + templates', () => {
  const grammar = [
    {
      is: ['given-name/human'],
      oneOf: [
        { value: 'Patrick' },
        { value: 'Patricia' },
        { value: 'Mark' },
        { value: 'Maria' },
        { value: 'Stewart' },
        { value: 'Susan' }
      ]
    },
    {
      is: ['surname/human'],
      oneOf: [
        { value: 'McDonald' },
        { value: 'Trudeau' },
        { value: 'Oswald' }
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
        { value: 'Sticky Fingers' },
        { value: 'The Butcher' },
        { value: 'Longwatch' }
      ]
    },
    {
      is: ['name/orc'],
      oneOf: [
        { value: 'Grok' },
        { value: 'Nobb' },
        { value: 'Arak' }
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
  ]

  const storage = new Storage(grammar);

  [
    ['understands fuzzy', 'name', 0, 'Patrick McDonald'],
    ['picks one of', 'name', 0.999, 'Susan "Longwatch" Oswald'],
    ['complex nested', 'npc', 0, {
      race: 'Human',
      name: 'Patrick McDonald'
    }]
  ].forEach(([scenario, type, randomV, expected]) => {
    it(scenario, async () => {
      const random = () => randomV
      const { result } = await generate({ storage, random }, type)
      expect(result).to.eql(expected)
    })
  })
})
