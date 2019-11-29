const plugin = require('../plugins/number')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/number', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        { number: {} }
      ]
    ],
    [
      [
        'undefined',
        {}
      ]
    ]
  )

  parsePartial(
    plugin,
    [
      [
        'easy',
        { number: '1 + 1' },
        {
          number: {
            eq: { args: [1, 1], op: '+' }
          }
        }
      ],
      [
        'with dice',
        { number: '2d6' },
        {
          number: {
            eq: { args: [2, 6], op: 'd' }
          }
        }
      ]
    ]
  )
})
