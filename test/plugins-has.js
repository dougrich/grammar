const { expect } = require('chai')
const plugin = require('../plugins/has')
const GrammarGenerator = require('../')

describe('plugin/has', () => {
  describe('#canGenerate', () => {
    it('can generate if definition has a has field', () => {
      expect(plugin.canGenerate({ has: [] })).to.be.true
    })
    it('cannot generate if definition lacks a has field', () => {
      expect(plugin.canGenerate({  })).to.be.false
    })
  })

  describe('#expand', () => {
    [
      [
        'simple has',
        {
          has: 'name/testcase'
        },
        {
          has: [
            { field: 'name', is: 'name/testcase' }
          ]
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
          has: [
            { field: 'test', value: 'what what' }
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
        'simple has',
        {
          has: 'name/testcase'
        },
        {
          name: 'tested'
        }
      ],
      [
        'value has',
        {
          has: [
            { field: 'test', value: 'what what' }
          ]
        },
        {
          test: 'what what'
        }
      ]
    ].forEach(([name, input, output]) => {
      it(name, async () => {
        const generator = new GrammarGenerator({
          storage: new GrammarGenerator.MemoryStorage([
            {
              is: 'name/testcase',
              value: 'tested'
            }
          ])
        })
        const expanded = plugin.expand(input)
        expect(await plugin.generate(expanded, generator)).to.eql(output)
      })
    })
  })
})