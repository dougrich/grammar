const plugin = require('../plugins/someOf')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/value', () => {
  canParse(
    plugin,
    [
      [
        'someOf',
        { someOf: {} }
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
        'simple',
        {
          someOf: {
            count: '2d6',
            each: 'test'
          }
        },
        {
          repeat: {
            count: { eq: { op: 'd', args: [2, 6] } },
            instance: null
          },
          $ref: {
            '/repeat/instance': { is: 'test' }
          }
        }
      ]
    ]
  )
})
