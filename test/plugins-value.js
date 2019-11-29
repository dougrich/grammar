const plugin = require('../plugins/value')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/value', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        { value: '1234' }
      ],
      [
        'null',
        { value: null }
      ],
      [
        'zero',
        { value: 0 }
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
        { value: '1234' },
        { value: '1234' }
      ]
    ]
  )
})
