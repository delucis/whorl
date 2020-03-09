# whorl ✏️❔

[![npm version](https://img.shields.io/npm/v/whorl.svg)](https://www.npmjs.com/package/whorl) [![Build Status](https://travis-ci.com/delucis/whorl.svg?branch=master)](https://travis-ci.com/delucis/whorl) [![Coverage Status](https://coveralls.io/repos/github/delucis/whorl/badge.svg?branch=master)](https://coveralls.io/github/delucis/whorl?branch=master) [![Known Vulnerabilities](https://snyk.io/test/npm/whorl/badge.svg)](https://snyk.io/test/npm/whorl) 

IPA: /huˌɑɹˈɛl/

**⚠️ WORK IN PROGRESS ⚠️**

Find out who the author(s) is/are from an input URL.


## Installation

```sh
npm install --save whorl
```


## Usage

```js
const WHORL = require('whorl')
WHORL('http://www.nytimes.com/2007/05/13/us/13names.html')
  .then((name) => {
    console.log(name) // ⇒ 'The Associated Press'
  })
```

If no author(s) can be deduced or the input URL is not valid, `whorl` will return `null`.


## Accuracy

Read [the latest test results](bench/benchmark.md).


## API

### whorl(url)

Returns a `Promise` for an author `String`.

#### url

Type: `String`

The URL for which to retrieve an author string.
