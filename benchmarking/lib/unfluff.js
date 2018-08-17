const UF = require('unfluff')
const GOT = require('got')

/**
 * Return an author from a given URL
 * @param  {String} URL The URL to test
 * @return {Promise<String>} The author of the URL
 */
module.exports = async URL => {
  try {
    const { body: html } = await GOT(URL, {
      headers: { 'user-agent': 'whorl/unfluff-benchmarking' },
      timeout: 12000
    })
    const metadata = UF.lazy(html)
    return metadata.author()
  } catch (e) {
    console.error(
      e.name,
      e.statusCode ? e.statusCode : '',
      e.url ? ' — ' + e.url : ''
    )
    return null
  }
}
