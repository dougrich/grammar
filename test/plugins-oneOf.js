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
              1,
              1
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
        { oneOf: ['exampleA', { value: 'exambleB' }] },
        {
          distribution: {
            weights: [
              1,
              1
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
              4,
              5
            ]
          },
          options: [
            null,
            null
          ],
          $ref: {
            '/options/0': { value: 'a' },
            '/options/1': { value: 'b' }
          }
        }
      ],
      [
        'easy value syntax',
        {
          oneOf: {
            values: [
              'a', 'b', 'c'
            ]
          }
        },
        {
          distribution: {
            weights: [
              1,
              1,
              1
            ]
          },
          options: [
            null,
            null,
            null
          ],
          $ref: {
            '/options/0': { value: 'a' },
            '/options/1': { value: 'b' },
            '/options/2': { value: 'c' }
          }
        }
      ]
    ]
  )
})
