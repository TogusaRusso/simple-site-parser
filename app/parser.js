'use strict'

const htmlparser = require('htmlparser2')
const urlParser = require('url')

/**
 * Parses webpage for H1 headers
 * @param {string} url - URL of  the webpage.
 * @returns {Promise} Promise, returns Array of H1 headers if resolved
 *  and Error when rejected
 */
function parse(url) {
  return new Promise((resolve, reject) => {
    // Неизвестно какой протокол подсунул пользователь
    let http
    switch(urlParser.parse(url).protocol) {
      case 'http:':
        http = require('http')
        break
      case 'https:':
        http = require('https')
        break  
      default:
        return reject(new Error('Парсер поддерживает только http и https протоколы'))
    }
    // Делаем машину состояний, используя htmlparser2
    let header = ''
    let collect = false
    let result = []
    const parser = new htmlparser.Parser({
      onopentag: name => {
        // Когда попали внутрь H1 тэга, начинаем собирать текст
        if (name.toLowerCase() !== 'h1') return
        header = ''
        collect = true
      },
      ontext: text => { 
        // Собираем текст только если внутри h1
        if (collect) header += text
      },
      onclosetag: name => {
        // На выходе из H1 заканчиваем сбор текста, а текст загоняем в массив  
        if (name.toLowerCase() !== 'h1') return
        if (header.trim()) result.push(header.trim())
        collect = false
        header = ''
      }
    },  {decodeEntities: true})
    // Загружаем страницу и прогоняем её через парсер
    http.get(url, res => res
      .on('data', chunk => parser.write(chunk))
      .on('end', () => {
        parser.end()
        resolve(result)
      })
    ).on('error', reject)
  })
}

module.exports = parse
