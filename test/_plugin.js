const { expect } = require('./_chai')

function canParse(plugin, parseable, unparseable) {
  describe('#canParse', () => {
    describe('can parse', () => {
      parseable.forEach(([name, definition]) => {
        it(name, () => {
          expect(plugin.canParse(definition)).to.be.true()
        })
      })
    })
    describe('cannot parse', () => {
      unparseable.forEach(([name, definition]) => {
        it(name, () => {
          expect(plugin.canParse(definition)).to.be.false()
        })
      })
    })
  })
}

function parsePartial(plugin, scenarios) {
  describe('#parsePartial', () => {
    scenarios.forEach(([name, definition, result]) => {
      it(name, () => {
        expect(plugin.parsePartial(definition)).to.eql(result)
      })
    })
  })
}

module.exports = {
  canParse,
  parsePartial
}