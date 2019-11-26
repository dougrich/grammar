const { expect } = require('./_chai')

const GrammarGenerator = require('..')

describe('#matchesIs', () => {
  [
    ['simple direct match', 'name', 'name', true],
    ['simple array match', 'name', ['name'], true],
    ['simple array-array match', ['name'], ['name'], true],
    ['realistic direct match', 'name', ['name/human'], true],
    ['realistic direct multiple match', 'place', ['place/oceanic', 'place/coastal'], true],
    ['realistic specific match', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/coastal'], true],
    ['realistic specific mismatch', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/deep'], false]
  ].forEach(([name, is, type, matches]) => {
    it(name, () => {
      expect(GrammarGenerator.matchesIs(is, type)).to.equal(matches)
    })
  })
})
