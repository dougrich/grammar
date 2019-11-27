const plugin = require('../plugins/has')
const { canParse, parsePartial } = require('./_plugin')

describe('plugins/has', () => {
  canParse(
    plugin,
    [
      [
        'simple',
        { has: [] }
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
        'simple has',
        { has: 'name/testcase' },
        {
          children: {
            name: null
          },
          $ref: {
            '/children/name': { is: 'name/testcase' }
          }
        }
      ],
      [
        'simple value',
        {
          has: [
            { field: 'test', value: 'what what' }
          ]
        },
        {
          children: {
            test: null
          },
          $ref: {
            '/children/test': { value: 'what what' }
          }
        }
      ],
      [
        'template',
        {
          has: [
            { field: 'test', value: 'what what' }
          ],
          template: 'get {test} with it'
        },
        {
          children: {
            test: null
          },
          $ref: {
            '/children/test': { value: 'what what' }
          },
          $template: [
            'get ',
            { lookup: '/test' },
            ' with it'
          ]
        }
      ]
    ]
  )
})