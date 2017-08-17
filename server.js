'use strict'

// init project
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
// Ввот наш парссер оттдельным ппакетом
const urlParser = require('./app/parser')

// Будем работать с формами, нужен bodyParser
app.use(bodyParser())
// Для вывода странички используем Pug 2.0
app.set('view engine', 'pug')

// Единственная корневая точка входа
app.route('/')
  // Отправляем страничку в первый раз
  .get((request, response) => {
    response.render('index')
  })
  // Обрабатываем POST запрос отправленный формой
  .post((request, response) => {
    let url = request.body.url.trim()
    urlParser(url)
    .then(headers => {
      // Если из парсера пришел пустой массив лучше вывести ошибку 
      if (headers.length === 0) 
        return response.render('index', {error: "Заголовки H1 не найдены", prevUrl: url})
      response.render('index', {headers, prevUrl: url})
    })
    // Если от парсера прилетит ошибка, выведем её для наглядности
    .catch(err => {
      console.error(err)
      response.render('index', {error: err.message, prevUrl: url})
    })
  })

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
