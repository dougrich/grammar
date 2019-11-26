const { expect } = require('chai')
const plugin = require('../plugins/oneOf')
const GrammarGenerator = require('../')

describe('plugins/oneOf', () => {
  describe('#canGenerate', () => {
    it('can generate if definition has a oneOf field', () => {
      expect(plugin.canGenerate({ oneOf: [] })).to.be.true
    })
    it('cannot generate if definition lacks a oneOf field', () => {
      expect(plugin.canGenerate({  })).to.be.false
    })
  })

  describe('#expand', () => {
    [
      [
        'simple oneOf',
        {
          oneOf: 'name/testcase'
        },
        {
          oneOf: [
            { value: 'name/testcase' }
          ]
        }
      ],
      [
        'simple value',
        {
          oneOf: [
            { value: 'what what' }
          ]
        },
        {
          oneOf: [
            { value: 'what what' }
          ]
        }
      ]
    ].forEach(([ name, input, output ]) => {
      it(name, () => {
        expect(plugin.expand(input)).to.eql(output)
      })
    })
  })

  describe('#generate', () => {
    [
      [
        'simple',
        {
          oneOf: ['0', '1', '2', '3']
        },
        0,
        '0'
      ],
      [
        'weighted',
        {
          oneOf: [
            'too low',
            { value: '5', weight: 100 },
            'too high',
            'way too high',
            'way way too high'
          ]
        },
        0.5,
        '5'
      ],
      [
        'complex',
        {
          oneOf: [
            { is: 'name/testcase' }
          ]
        },
        0,
        'tested'
      ]
    ].forEach(([ name, input, randomV, output ]) => {
      it(name, async () => {
        const generator = new GrammarGenerator({
          storage: new GrammarGenerator.MemoryStorage([
            {
              is: 'name/testcase',
              value: 'tested'
            }
          ]),
          random: () => randomV
        })
        const expanded = plugin.expand(input)
        expect(await plugin.generate(expanded, generator)).to.eql(output)
      })

    })
  })
})