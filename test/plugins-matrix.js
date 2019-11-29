const plugin = require('../plugins/matrix')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/value', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        {
          matrix: {

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
          matrix: {
            inputs: [
              { lookup: '../morality' },
              { lookup: '../villiany' }
            ],
            rows: [
              { value: 'red', coefficients: [0.5, 0.6] },
              { value: 'blue', coefficients: [0.7, 0.2] }
            ]
          }
        },
        {
          dependsOn: ['../morality', '../villiany'],
          distribution: {
            matrix: {
              inputs: [
                { lookup: '../morality' },
                { lookup: '../villiany' }
              ],
              values: [
                [0.5, 0.6],
                [0.7, 0.2]
              ]
            }
          },
          options: [
            { value: 'red' },
            { value: 'blue' }
          ]
        }
      ]
    ]
  )
})
