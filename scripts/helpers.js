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

const isNumeric = (something) =>
  !isNaN(something)

module.exports = {
  writeFilePromise,
  isNumeric
}