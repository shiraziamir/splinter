const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const m = require('./middleware');

const app = express();

const configFile = path.join(__dirname, process.env.CONF);
const ip = process.env.IP || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

app.use((req, res, next) => {
  if (!req.app.locals.testResults) {
    // hold aggregated test results
    req.app.locals.testResults = {};
  }
  // if (!app.locals.testResults) {
  //     // hold aggregated test results
  //     app.locals.testResults = {}
  // }
  next();
});

// build list of tests to run based on config
app.locals.conf = JSON.parse(
  fs.readFileSync(configFile, { encoding: 'utf-8' }),
);
const tests = [];

if (app.locals.conf.testMongo) {
  tests.push(m.testMongo);
}
if (app.locals.conf.testMysql) {
  tests.push(m.testMysql);
}
if (app.locals.conf.testPostgres) {
  tests.push(m.testPostgres);
}
if (app.locals.conf.testRabbit) {
  tests.push(m.testRabbit);
}
if (app.locals.conf.testRedis) {
  tests.push(m.testRedis);
}
if (app.locals.conf.testMock) {
  tests.push(m.testMock);
}
if (tests.length === 0) {
  req.app.locals.testResults = { message: 'No tests enabled.' };
  // app.locals.testResults = { message: 'No tests enabled.' }
}

// routes
app.get('/', tests, (req, res, next) => {
  res.send(
    yaml.dump({
      timestamp: new Date().toJSON(),
      results: req.app.locals.testResults,
    }),
  );
});

app.all('*', (req, res, next) => {
  res.status(404).json({ message: 'Page not found.' });
});

app.listen(port, ip, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on ${ip}: ${port} `);
});
