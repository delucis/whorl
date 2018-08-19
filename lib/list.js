/**
 * Convert items in an array into a sentence-style list.
 * @param  {Array}  a             Array of items to be formatted
 * @param  {String} [sep=', ']    Separator between list items
 * @param  {String} [and=' and '] Separator between last two list items
 * @return {String}               Sentence-style list
 */
module.exports = (a, { sep = ', ', and = ' and ' } = {}) => {
  if (!Array.isArray(a)) throw new TypeError(`Expected array, got ${typeof a}`)
  if (a.length === 0) return ''
  if (a.length === 1) return a[0]
  return a.slice(0, -1).join(sep) + and + a.slice(-1)
}
