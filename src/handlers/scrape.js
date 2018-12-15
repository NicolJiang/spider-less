'use strict'

const cheerio = require('cheerio')
const signale = require('signale')
const { crawl } = require('../libs/spider')

module.exports = (subscription, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const url = subscription.url
  signale.info(`Start scraping: ${url}`)

  crawl(subscription.url)
    .then(load)
    .then($ => parse(subscription, $))
    .then(res => {
      // NOTE: do whatever you want with it :)
      signale.success('Bingo', res)
      callback(null)
    })
    .catch(err => {
      signale.error(`Error scraping ${url}`, err)
      callback(err)
    })
}

function load (htmlStr) {
  return new Promise((resolve, reject) => {
    if (!htmlStr || typeof htmlStr !== 'string') {
      return reject(new Error('No valid HTML string detected'))
    }
    return resolve(cheerio.load(htmlStr))
  })
}

function parse (subscription, $) {
  return new Promise((resolve, reject) => {
    let res = []
    try {
      res = subscription.targets.map(t => {
        return { label: t.label, content: extract($, t) }
      })
      resolve(res)
    } catch (err) {
      reject(new Error(`Error parsing scrape results: ${err.message}`))
    }
  })
}

function extract($, target) {
  return $(target.selector).text()
}
