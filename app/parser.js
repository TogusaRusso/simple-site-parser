'use strict'

const htmlparser = require('htmlparser2')
const urlParser = require('url')

/**
 * Parses webpage for tag element
 * @param {string} url - URL of  the webpage
 * @param {string} [tag = h1] - Which tag to search in page, 'h1' by default
 * @returns {Promise} Promise, returns Array of H1 headers if resolved
 *  and Error when rejected
 */
function parse (url, tag = 'h1') {
  tag = tag.toLowerCase()
  return new Promise((resolve, reject) => {
    // Неизвестно какой протокол подсунул пользователь
    let http
    switch (urlParser.parse(url).protocol) {
      case 'http:':
        http = require('http')
        break
      case 'https:':
        http = require('https')
        break
      default:
        return reject(
          new Error('Парсер поддерживает только http и https протоколы')
        )
    }
    // Делаем машину состояний, используя htmlparser2
    let header = ''
    let collect = 0
    let result = []
    const parser = new htmlparser.Parser(
      {
        onopentag: name => {
          // Когда попали внутрь тэга, начинаем собирать текст
          if (name.toLowerCase() !== tag) return
          header = ''
          // тэги могут быть вложеными, поэтому считаем уровни
          collect++
        },
        ontext: text => {
          // Собираем текст только если внутри тэга
          if (collect) header += text
        },
        onclosetag: name => {
          // На выходе из тэга заканчиваем сбор текста, а текст загоняем в массив
          if (name.toLowerCase() !== tag) return
          if (header.trim()) result.push(header.trim())
          collect--
          header = ''
        }
      },
      { decodeEntities: true }
    )
    // Загружаем страницу и прогоняем её через парсер
    http
      .get(url, res =>
        res.on('data', chunk => parser.write(chunk)).on('end', () => {
          parser.end()
          resolve(result)
        })
      )
      .on('error', reject)
  })
}

module.exports = parse
