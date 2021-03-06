const express = require('express')
const prometheus = require('prom-client')
const runTests = require('./util/runTests')

const app = express()
app.use(express.json())

prometheus.collectDefaultMetrics({ prefix: 'splinter_' })

app.get('/', runTests, (req, res) => {
  const errorsDetected = res.locals.testResults.some(test => test.message !== 'OK')
  let statusCode = 200
  if (errorsDetected) statusCode = 502
  res.status(statusCode).send({ results: res.locals.testResults })
})

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(prometheus.register.metrics())
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Invalid request.' })
})

module.exports = app
