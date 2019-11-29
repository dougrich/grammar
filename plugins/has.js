const arrayify = require('../util/arrayify')
const parseTemplate = require('../util/parseTemplate')

function canParse (s) {
  return !!s.has
}

function parsePartial (s) {
  let has = s.has
  if (typeof has === 'object' && !Array.isArray(has)) {
    const arrayed = []
    for (const k in has) {
      const leaf = has[k]
      if (typeof leaf === 'object') {
        arrayed.push(Object.assign({ field: k }, leaf))
      } else {
        arrayed.push({ field: k, is: leaf })
      }
    }
    has = arrayed
  } else {
    has = arrayify(has)
  }
  const children = {}
  const $ref = {}
  for (let i = 0; i < has.length; i++) {
    let field = has[i]
    if (typeof field === 'string') {
      const [fieldname] = field.split('/', 1)
      field = {
        field: fieldname,
        is: field
      }
    }
    const child = JSON.parse(JSON.stringify(field))
    children[child.field] = null
    const key = '/children/' + child.field
    delete child.field
    $ref[key] = child
  }

  const result = {
    children,
    $ref
  }

  if (s.template) {
    result.$template = parseTemplate(s.template)
  }

  return result
}

module.exports = {
  canParse,
  parsePartial
}
