const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('..')

describe('scenario/contextual', () => {
  const grammar = [
    {
      is: 'room/racial',
      has: {
        details: {
          someOf: {
            count: '1d3',
            each: 'details/racial'
          }
        },
        mooks: {
          someOf: {
            count: '1d3',
            each: 'mook/racial'
          }
        }
      }
    },
    {
      is: 'details/racial',
      switch: {
        '/race': {
          goblin: { is: 'details/goblin' },
          spider: { is: 'details/spider' }
        }
      }
    },
    {
      is: 'mook/racial',
      switch: {
        '/race': {
          goblin: { is: 'mook/goblin' },
          spider: { is: 'mook/spider' }
        }
      }
    },
    {
      is: 'details/goblin',
      oneOf: {
        values: [
          'piles of filth stuck in the corners',
          'dirty hamper baskets arranged into a makeshift fort',
          'messy plates covered in moldy unfinished food on every surface'
        ]
      }
    },
    {
      is: 'details/spider',
      oneOf: {
        values: [
          'cobwebs hanging from every corner',
          'dense strands of webbing covering the entrances and exits',
          'small cocoons in the shape of familiar woodland animals'
        ]
      }
    },
    {
      is: 'mook/goblin',
      oneOf: {
        values: [
          'goblin',
          'goblin spellcaster',
          'goblin boss'
        ]
      }
    },
    {
      is: 'mook/spider',
      oneOf: {
        values: [
          'small spider',
          'medium spider',
          'giant spider'
        ]
      }
    },
    {
      is: 'dungeon',
      has: {
        race: {
          oneOf: {
            values: [
              'goblin',
              'spider'
            ]
          }
        },
        room: 'room'
      }
    }
  ]

  const storage = new Storage(grammar);

  [
    [
      'basic',
      'dungeon',
      0,
      {
        race: 'goblin',
        room: {
          details: [
            'piles of filth stuck in the corners'
          ],
          mooks: [
            'goblin'
          ]
        }
      }
    ],
    [
      'basic inverse',
      'dungeon',
      0.999,
      {
        race: 'spider',
        room: {
          details: [
            'small cocoons in the shape of familiar woodland animals',
            'small cocoons in the shape of familiar woodland animals',
            'small cocoons in the shape of familiar woodland animals'
          ],
          mooks: [
            'giant spider',
            'giant spider',
            'giant spider'
          ]
        }
      }
    ]
  ].forEach(([scenario, type, randomV, expected]) => {
    it(scenario, async () => {
      const random = () => randomV
      const { result } = await generate({ storage, random }, type)
      expect(result).to.eql(expected)
    })
  })
})
