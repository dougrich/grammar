const plugin = require('../plugins/oneOf')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/oneOf', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        { oneOf: [] }
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
        'simple oneOf',
        { oneOf: 'example' },
        { value: 'example' }
      ],
      [
        'simple choice',
        { oneOf: ['exampleA', 'exampleB'] },
        {
          distribution: {
            weights: [
              { absolute: 1 },
              { absolute: 1 }
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': { is: 'exampleA' },
            '/options/1': { is: 'exampleB' }
          }
        }
      ],
      [
        'referencedChoice',
        { oneOf: ['exampleA', { value: 'exambleB' } ] },
        {
          distribution: {
            weights: [
              { absolute: 1 },
              { absolute: 1 }
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': { is: 'exampleA' },
            '/options/1': { value: 'exambleB' }
          }
        }
      ]
    ]
  )
})