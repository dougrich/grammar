const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('..')

describe('scenario/language', () => {
  const grammar = [
    {
      is: 'consonant',
      oneOf: [
        { value: 't' },
        { value: 'd' },
        { value: 'k' },
        { value: 'g' },
        { value: 'th' },
        { value: 'z' },
        { value: 'n' },
        { value: 'r' }
      ]
    },
    {
      is: 'vowel/short',
      oneOf: [
        { value: 'a' },
        { value: 'e' },
        { value: 'u' },
        { value: 'i' },
        { value: 'y' },
        { value: 'ae' }
      ]
    },
    {
      is: 'vowel/long',
      oneOf: [
        { value: 'aa' },
        { value: 'ee' },
        { value: 'uu' },
        { value: 'ii' },
        { value: 'yy' },
        { value: 'aee' }
      ]
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

  const storage = new Storage(grammar);
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
