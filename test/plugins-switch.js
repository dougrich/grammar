const plugin = require('../plugins/switch')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/value', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        {
          switch: {

          }
        }
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
          switch: {
            '../color': {
              red: { value: 'pink' },
              blue: { value: 'periwinkle' },
              green: { value: 'lime' },
              $default: { value: 'black' }
            }
          }
        },
        {
          dependsOn: ['../color'],
          distribution: {
            matrix: {
              inputs: [
                { lookup: '../color', eq: 'red' },
                { lookup: '../color', eq: 'blue' },
                { lookup: '../color', eq: 'green' },
                0
              ],
              values: [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 0]
              ]
            }
          },
          options: [
            { value: 'pink' },
            { value: 'periwinkle' },
            { value: 'lime' },
            { value: 'black' }
          ]
        }
      ]
    ]
  )
})
