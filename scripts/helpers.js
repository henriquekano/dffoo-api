const R = require('ramda')
const fs = require('fs')

const writeFilePromise = (fileName, data) =>
  new Promise((res, rej) => {
    fs.writeFile(fileName, data, (err) => {
      if (err) {
        return rej(err)
      }
      res()
    })
  })

const readFilePromise = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, function read(err, data) {
      if (err) {
        return reject(err)
      }
      resolve(data.toString())
    })
  })


const isNumeric = (something) =>
  !isNaN(something)

const fromNaturalLanguage = (aString) =>
  aString.split(' ')

const toSnakeCase = R.pipe(
  R.map(R.toLower),
  R.join('_')
)

module.exports = {
  writeFilePromise,
  readFilePromise,
  isNumeric,
  fromNaturalLanguage,
  toSnakeCase,
}