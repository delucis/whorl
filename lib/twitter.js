'use strict'

const HOSTNAME = /^(\S+\.)?twitter\.com$/i
const TWEET = /^\/([a-zA-Z0-9_]{1,15})\/status\/\d+\/?$/
const PROFILE = /^\/([a-zA-Z0-9_]{1,15})\/?$/

function isTwitter (urlObject) {
  return HOSTNAME.test(urlObject.hostname)
}

function isTweet (urlObject) {
  return TWEET.test(urlObject.pathname)
}

function isTwitterProfile (urlObject) {
  return PROFILE.test(urlObject.pathname)
}

function getTwitterHandle (urlObject) {
  if (!isTwitter(urlObject)) return null
  let handle
  if (isTweet(urlObject)) {
    handle = urlObject.pathname.match(TWEET)[1]
  } else if (isTwitterProfile(urlObject)) {
    handle = urlObject.pathname.match(PROFILE)[1]
  }
  if (handle) {
    return `@${handle}`
  }
  return null
}

module.exports = getTwitterHandle
