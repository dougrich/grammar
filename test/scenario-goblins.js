const { expect } = require('./_chai')
const Storage = require('./_memory-storage')

const { generate } = require('..')

describe('scenario/goblins', () => {
  const grammar = [
    {
      is: 'outpost/goblin',
      has: [
        'guards/goblin',
        'tower/goblin'
      ],
      template: '{guards}, based out of {tower}'
    },
    {
      is: 'guards/goblin',
      has: {
        minionCount: { number: '2d6 + 1' }
      },
      template: `{minionCount} goblins lead by a daring goblin boss`
    },
    {
      is: 'tower/goblin',
      oneOf: [
        { value: 'a teetering stone ruin perched on a cliff' },
        { value: 'a warren filled with stolen silk undergarments and filth' }
      ]
    }
  ]

  const storage = new Storage(grammar);

  [
    ['minimal', 'outpost/goblin', 0, '3 goblins lead by a daring goblin boss, based out of a teetering stone ruin perched on a cliff']
  ].forEach(([scenario, type, randomV, expected]) => {
    it(scenario, async () => {
      const random = () => randomV
      const { result } = await generate({ storage, random }, type)
      expect(result).to.eql(expected)
    })
  })
})
