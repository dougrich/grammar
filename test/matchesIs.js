const { expect } = require('./_chai')

const matchesIs = require('../util/matchesIs')

describe('#matchesIs', () => {
  [
    ['simple direct match', 'name', 'name', true],
    ['simple array match', 'name', ['name'], true],
    ['simple array-array match', ['name'], ['name'], true],
    ['realistic direct match', 'name', ['name/human'], true],
    ['realistic direct multiple match', 'place', ['place/oceanic', 'place/coastal'], true],
    ['realistic specific match', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/coastal'], true],
    ['realistic specific mismatch', ['place/oceanic', 'place/coastal'], ['place/oceanic', 'place/deep'], false],
    ['prefix mismatch', 'guard', 'guard-detail/goblin', false],
    ['prefix mismatch', 'guard', 'guards/goblin', false]
  ].forEach(([name, is, type, matches]) => {
    it(name, () => {
      expect(matchesIs(is, type)).to.equal(matches)
    })
  })
})
