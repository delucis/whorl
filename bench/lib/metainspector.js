const MI = require('node-metainspector')

/**
 * Return an author from a given URL
 * @param  {String} URL The URL to test
 * @return {Promise<String>} The author of the URL
 */
module.exports = URL => {
  return new Promise(function (resolve, reject) {
    let client = new MI(URL, { timeout: 12000 })
    client.on('fetch', () => {
      resolve(client.author)
    })
    client.on('error', e => {
      resolve(null)
    })
    client.fetch()
  })
}
