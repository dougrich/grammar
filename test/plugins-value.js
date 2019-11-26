const { expect } = require('./_chai')
const plugin = require('../plugins/value')

describe('plugins/value', () => {
  describe('#canGenerate', () => {
    it('can generate if definition has a value field', () => {
      expect(plugin.canGenerate({ value: [] })).to.be.true()
    })
    it('cannot generate if definition lacks a value field', () => {
      expect(plugin.canGenerate({ })).to.be.false()
    })
  })

  describe('#generate', () => {
    it('returns value', () => {
      expect(plugin.generate({ value: '1234' })).to.eql('1234')
    })
  })
})
