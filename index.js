'use strict'

const { URL } = require('url')
const isUrl = require('is-url-superb')
const scrape = require('html-metadata')
const jp = require('jsonpath')
const arrayToSentence = require('array-to-sentence')
const upperfirst = require('lodash.upperfirst')
const fromTwitter = require('./lib/twitter')

function toStartCase (string) {
  string = string.toLowerCase()
  string = string.split(' ')
  string.forEach((word, i, a) => {
    a[i] = upperfirst(word)
  })
  string = string.join(' ')
  return string
}

function tidy (string) {
  string = string.trim()                      // strip whitespace
  string = string.match(/^(by +)?(.+)$/i)[2]  // remove ‘by’ or ‘By’ from start
  if (string === string.toUpperCase()) string = toStartCase(string)
  if (string) return string
  return null
}

function fromAuthor (meta) {
  if (meta.hasOwnProperty('author') && meta.author.length > 0) {
    return tidy(meta.author)
  }
  return null
}

function fromStructuredData (data) {
  let results = []
  jp.query(data, '$..author').map(author => {
    if (typeof author === 'string') {
      results.push(author)
    } else {
      jp.query(author, '$..name').map(name => {
        if (typeof name === 'string') {
          results.push(name)
        }
        if (Array.isArray(name)) {
          name.map(n => { results.push(n) })
        }
      })
    }
  })
  results.forEach((result, i, a) => { a[i] = tidy(result) })
  if (results.length === 1) {
    return results[0]
  }
  if (results.length > 1) {
    return arrayToSentence(results)
  }
  return null
}

module.exports = async function (url) {
  // that’s not even a URL (╯°□°）╯︵ ┻━┻
  if (!isUrl(url)) return null
  // fetch metadata
  let data = await scrape(url)
  // first try <meta name="author" … >
  let author = fromAuthor(data.general)
  if (author) return author
  // try to extract author from JSON-LD
  if (data.hasOwnProperty('jsonLd')) {
    author = fromStructuredData(data.jsonLd)
    if (author) return author
  }
  // try to extract author from schemaOrg
  if (data.hasOwnProperty('schemaOrg')) {
    author = fromStructuredData(data.schemaOrg)
    if (author) return author
  }
  // handle Twitter
  // create parsed URL from metadata URL
  let urlObject = new URL(data.general.canonical)
  author = fromTwitter(urlObject)
  if (author) return author
  // all is lost
  console.dir(data, { depth: null })
  return null
}
