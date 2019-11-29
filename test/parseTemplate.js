const { expect } = require('./_chai')
const parseTemplate = require('../util/parseTemplate')

describe('#parseTemplate', () => {
  [
    [
      'simple',
      'get {test} with it',
      [
        'get ',
        { lookup: '/test' },
        ' with it'
      ]
    ]
  ].forEach(([name, input, output]) => {
    it(name, () => {
      expect(parseTemplate(input)).to.eql(output)
    })
  })
})
