const R = require('ramda')
const jsonServer = require('json-server')
const db = require('./db.json')

const server = jsonServer.create()
const router = jsonServer.router('db.json', {
  customSuffixes: ['_ninc', '_inc', '_distinct']
})
const middlewares = jsonServer.defaults({
  readOnly: true,
})

// disable /db
server.use((req, res, next) => {
  if (req.path === '/db') {
    res.status(403).end()
    return
  }
  next()
})
server.use(middlewares)
// default pagination
server.use((req, _res, next) => {
  const hasAnyDistinctParameter = Object.keys(req.query)
    .some((queryParameter) => queryParameter.endsWith('_distinct'))
  if (hasAnyDistinctParameter) {
    next()
    return
  }
  if (!req.query._limit
    || (/\d+/.test(req.query._limit) && parseInt(req.query._limit) > 50)) {
    req.query._limit = 20
  }
  if (
    /\d+/.test(req.query._start) && !req.query._limit
    || /\d+/.test(req.query._start) && /\d+/.test(req.query._limit) && parseInt(req.query._limit) - parseInt(req.query._start) > 50
  ) {
    req.query._limit = (parseInt(req.query._start) + 20).toString()
  }
  if (
    /\d+/.test(req.query._start) && !req.query._limit
    || /\d+/.test(req.query._start) && /\d+/.test(req.query._end) && parseInt(req.query._end) - parseInt(req.query._start) > 50
  ) {
    req.query._end = (parseInt(req.query._start) + 20).toString()
  }
  next()
})
server.get('/endpoints', (req, res) => {
  const response = R.pipe(
    R.toPairs,
    R.map(
      R.over(R.lensProp(1), R.length)
    ),
    R.fromPairs,
  )(db)
  res.json(response)
})
server.use(router)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = server
