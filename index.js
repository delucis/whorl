'use strict'

const { URL } = require('url')
const isUrl = require('is-url-superb')
const scrape = require('html-metadata')
const jp = require('jsonpath')
const arrayToSentence = require('array-to-sentence')
const upperfirst = require('lodash.upperfirst')
const unique = require('lodash.uniq')
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

function queryStructuredData (data) {
  let results = []
  let authors = jp.query(data, '$..author')
  authors.map(author => {
    if (typeof author === 'string') {
      results.push(author)
      return
    }
    let names = jp.query(author, '$..name')
    if (names.length > 0) {
      names.map(name => {
        if (typeof name === 'string') {
          results.push(name)
        }
        if (Array.isArray(name)) {
          name.map(n => { results.push(n) })
        }
      })
      return
    }
    if (Array.isArray(author)) {
      author.map(member => {
        if (typeof member === 'string') {
          results.push(member)
        }
      })
    }
  })
  return results
}

function fromStructuredData (data) {
  let results = queryStructuredData(data)
  results.forEach((result, i, a) => { a[i] = tidy(result) })
  results = unique(results)
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
  let author = null
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
  // try <meta name="author" … >
  author = fromAuthor(data.general)
  if (author) return author
  // handle Twitter
  // create parsed URL from metadata URL
  let urlObject = new URL(data.general.canonical)
  author = fromTwitter(urlObject)
  if (author) return author
  // all is lost
  console.dir(data, { depth: null })
  return null
}
