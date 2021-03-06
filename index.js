'use strict'

const { URL } = require('url')
const isUrl = require('is-url-superb')
const scrape = require('html-metadata')
const jp = require('jsonpath')
const arrayToSentence = require('./lib/list')
const fromTwitter = require('./lib/twitter')

const upperfirst = s => s[0].toUpperCase() + s.slice(1)
const toStartCase = s => s.toLowerCase().split(' ').map(upperfirst).join(' ')
const collapseWhitespace = s => s.replace(/\s+/g, ' ')

function trimPunctuation (string) {
  const punctuation = '\\s-–—….,;:?!¡•/\\(){}<>*%@$¢€$#‹›«»‘’“”"\'[\\]'
  let leadingPunctuation = new RegExp('^[' + punctuation + ']+')
  let trailingPunctuation = new RegExp('[' + punctuation + ']+$')
  string = string.replace(leadingPunctuation, '')
  string = string.replace(trailingPunctuation, '')
  return string
}

function removeTextFollowingPunctuation (string) {
  const punctuationWithLeadingSpace = '-.–,—\'’'
  const punctuation = '…;:?!¡•/\\(){}<>*%@$¢€$#‹›«»‘“”"[\\]'
  let followingPunctuation = new RegExp('(\\s+[' + punctuationWithLeadingSpace + ']|[' + punctuation + ']+).+$')
  return string.replace(followingPunctuation, '')
}

function stripLeadingPreposition (string) {
  const prepositions = 'by|von|par'
  const leadingPrepositions = new RegExp('^(' + prepositions + ')\\s+', 'i')
  return string.replace(leadingPrepositions, '')
}

function tidy (string) {
  string = collapseWhitespace(string)       // reduce any whitespace to single spaces
  string = string.trim()                    // strip leading or trailing whitespace
  string = trimPunctuation(string)          // strip leading or trailing punctuation
  string = stripLeadingPreposition(string)  // remove common prepositions from start of string
  string = removeTextFollowingPunctuation(string)
  if (string === string.toUpperCase()) string = toStartCase(string)
  return string
}

function fromAuthor (meta) {
  if (meta.hasOwnProperty('author') && meta.author.length > 0) {
    return tidy(meta.author)
  }
  return null
}

function queryStructuredData (data) {
  let results = []
  let authorWithArticleBody = jp.query(data, '$..*[?(@["author"] && (@["https://schema.org/articleBody"]) || @["articleBody"])]')
  let dataSource = authorWithArticleBody.length > 0 ? authorWithArticleBody : data
  let authors = jp.query(dataSource, '$..author')
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

function isSlug (string) {
  return /^[\d\w-]+\.[\w]*$/.test(string)
}

function isValidResult (res) {
  let validity = res.length > 0
  if (validity) { validity = !isUrl(res) }
  if (validity) { validity = !isSlug(res) }
  return validity
}

function fromStructuredData (data) {
  let results = queryStructuredData(data)
  results = results.reduce((results, author) => {
    if (!isValidResult(author)) return results
    author = tidy(author)
    if (isValidResult(author) && !results.includes(author)) {
      results.push(author)
    }
    return results
  }, [])
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
  let data
  try {
    data = await scrape({
      url: url,
      headers: { 'User-Agent': 'whorl' }
    })
  } catch (e) {
    return null
  }
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
  if (author && isValidResult(author)) return author
  // handle Twitter
  // create parsed URL from metadata URL
  let urlObject = new URL(data.general.canonical || url)
  author = fromTwitter(urlObject)
  if (author) return author
  // all is lost
  return null
}
