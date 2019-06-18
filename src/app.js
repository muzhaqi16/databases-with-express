require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const moment = require('moment');
const helmet = require('helmet')

const { NODE_ENV } = require('./config')
const ArticlesService = require('./articles-service')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

app.get('/articles', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ArticlesService.getAllArticles(knexInstance)
        .then(articles => {
            res.json(articles.map(article => ({
                id: article.id,
                title: article.title,
                style: article.style,
                content: article.content,
                date_published: moment(new Date(article.date_published)).toISOString(true),
            })))
        })
        .catch(next)
})
app.get('/articles/:article_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ArticlesService.getById(knexInstance, req.params.article_id)
        .then(article => {
            if (!article) {
                return res.status(404).json({
                    error: { message: `Article doesn't exist` }
                })
            }
            res.json({
                id: article.id,
                title: article.title,
                style: article.style,
                content: article.content,
                date_published: moment(new Date(article.date_published)).toISOString(true),
            })
        })
        .catch(next)
})
app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV == 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
});

module.exports = app;