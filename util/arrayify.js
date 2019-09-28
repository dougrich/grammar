module.exports = function arrayify(objectOrArray) {
  if (Array.isArray(objectOrArray)) {
    return objectOrArray
  } else {
    return [objectOrArray]
  }
}