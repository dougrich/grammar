const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('..')

describe('scenario/language', () => {
  const lexicalGrammer = [
    {
      is: 'consonant',
      oneOf: {
        values: [
          't',
          'd',
          'k',
          'g',
          'th',
          'z',
          'n',
          'r'
        ]
      }
    },
    {
      is: 'vowel/short',
      oneOf: {
        values: [
          'a',
          'e',
          'u',
          'i',
          'y',
          'ae'
        ]
      }
    },
    {
      is: 'vowel/long',
      oneOf: {
        values: [
          'aa',
          'ee',
          'uu',
          'ii',
          'yy',
          'aee'
        ]
      }
    },
    {
      is: 'syllable/prefix',
      has: [
        'consonant',
        'vowel'
      ],
      template: '{consonant}{vowel}-'
    },
    {
      is: 'syllable/suffix',
      has: [
        'consonant',
        'vowel'
      ],
      template: '-{vowel}{consonant}'
    },
    {
      is: 'syllable/center',
      has: {
        leading: 'consonant',
        vowel: 'vowel',
        trailing: 'consonant'
      },
      template: '{leading}{vowel}{trailing}'
    },
    {
      is: 'word',
      has: {
        prefixes: {
          someOf: {
            count: '1d4',
            each: 'syllable/prefix'
          }
        },
        suffixes: {
          someOf: {
            count: '1d4',
            each: 'syllable/suffix'
          }
        },
        center: 'syllable/center'
      },
      template: '{#each prefixes}{.}{/each}{center}{#each suffixes}{.}{/each}'
    }
  ]
  describe('phonemic construction', () => {
    const storage = new Storage(lexicalGrammer);
    [
      ['minimal simple', 'word', 0, 'ta-tat-at'],
      ['maximal simple', 'word', 0.999, 'raee-raee-raee-raee-raeer-aeer-aeer-aeer-aeer']
    ].forEach(([scenario, type, randomV, expected]) => {
      it(scenario, async () => {
        const random = () => randomV
        const { result } = await generate({ storage, random }, type)
        expect(result).to.eql(expected)
      })
    })
  })
  describe('lexical construction', () => {
    const grammer = [
      ...lexicalGrammer,
      {
        is: 'adjective/direction',
        oneOf: [
          {
            weight: 2,
            value: {
              prefix: 'ner-',
              translation: 'approaching'
            }
          },
          {
            weight: 3,
            value: {
              prefix: 'neer-',
              translation: 'directly advancing'
            }
          },
          {
            weight: 2,
            value: {
              prefix: 'nar-',
              translation: 'retreating'
            }
          },
          {
            weight: 3,
            value: {
              prefix: 'naar-',
              translation: 'intently withdrawing'
            }
          },
          {
            weight: 3,
            value: {
              prefix: 'dyr-',
              translation: 'rising'
            }
          },
          {
            weight: 5,
            value: {
              prefix: 'dyyr-',
              translation: 'powerfully ascendant'
            }
          },
          {
            weight: 1,
            value: {
              prefix: 'daer-',
              translation: 'falling'
            }
          },
          {
            weight: 0.5,
            value: {
              prefix: 'daeer-',
              translation: 'pitifully falling'
            }
          }
        ]
      },
      {
        is: 'adjective/color',
        oneOf: {
          values: [
            { prefix: 'zadu-', translation: 'red' },
            { prefix: 'zake-', translation: 'blue' },
            { prefix: 'zaty-', translation: 'green' },
            { prefix: 'zanae-', translation: 'black' },
            { prefix: 'zari-', translation: 'white' }
          ]
        }
      },
      {
        is: 'name/draconic',
        has: {
          center: 'word',
          color: 'adjective/color',
          direction: 'adjective/direction'
        },
        template: '{direction/prefix}{color/prefix}{center} - {center} the {direction/translation} {color/translation} dragon'
      }
    ]
    const storage = new Storage(grammer);
    [
      ['minimal simple', 'name/draconic', 0, 'ner-zadu-ta-tat-at - ta-tat-at the approaching red dragon'],
      ['maximal simple', 'name/draconic', 0.999, 'daeer-zari-raee-raee-raee-raee-raeer-aeer-aeer-aeer-aeer - raee-raee-raee-raee-raeer-aeer-aeer-aeer-aeer the pitifully falling white dragon']
    ].forEach(([scenario, type, randomV, expected]) => {
      it(scenario, async () => {
        const random = () => randomV
        const { result } = await generate({ storage, random }, type)
        expect(result).to.eql(expected)
      })
    })
  })
})
