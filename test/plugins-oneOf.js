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
      ],
      [
        'manual weighting',
        { oneOf: [{ value: 'a', weight: 4 }, { value: 'b', weight: 5 }] },
        {
          distribution: {
            weights: [
              { absolute: 4 },
              { absolute: 5 }
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': { value: 'a' },
            '/options/1': { value: 'b' },
          }
        }
      ]
    ]
  )
})