const MS = require('metascraper')
const GOT = require('got')

/**
 * Return an author from a given URL
 * @param  {String} URL The URL to test
 * @return {Promise<String>} The author of the URL
 */
module.exports = async URL => {
  try {
    const { body: html, url } = await GOT(URL, {
      headers: { 'user-agent': 'whorl/metascraper-benchmarking' },
      timeout: 12000
    })
    const metadata = await MS({html, url})
    return metadata.author
  } catch (e) {
    console.error(
      e.name,
      e.statusCode ? e.statusCode : '',
      e.url ? ' — ' + e.url : ''
    )
    return null
  }
}
