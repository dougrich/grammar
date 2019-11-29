const { expect } = require('./_chai')
const { toSeed, fromSeed } = require('../serializeSeed')

describe('serializeSeed', () => {
  it('goes back and forth', () => {
    const set = [0, 4, 9324]
    expect(fromSeed(toSeed(set))).to.eql(set)
  })
})
