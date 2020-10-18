const R = require('ramda')
const fs = require('fs')

const countUp = function* (arrayOfMaxes) {
  const state = new Array(arrayOfMaxes.length).fill(0)
  while (true) {
    yield state
    let carry = 1
    for (let i = state.length - 1; i >= 0 && carry > 0; i--) {
      let newStateNumber = state[i]
      if (newStateNumber + carry > arrayOfMaxes[i]) {
        newStateNumber = 0
        carry = 1
      } else {
        newStateNumber += 1
        carry = 0
      }
      state[i] = newStateNumber
    }
  }
}

const writeFilePromise = (fileName, data) =>
  new Promise((res, rej) => {
    fs.writeFile(fileName, data, (err) => {
      if (err) {
        return rej(err)
      }
      return res()
    })
  })

const readFilePromise = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data.toString())
    })
  })

const isNumeric = (something) =>
  /^\d+$/.test(String(something))

const fromNaturalLanguage = (aString) =>
  aString.split(' ')

const toSnakeCase = R.pipe(
  R.map(R.toLower),
  R.join('_'),
)

const elementWithId = (collection, id, defaultValue = '') =>
  collection.find(R.propEq('id', id)) || defaultValue

const relateCommandToCharacter = R.curry((commands, characters) =>
  commands.map((command) => {
    const character = R.filter(R.propEq('slug', command.character_slug))(
      characters,
    )[0]
    return {
      ...command,
      characterId: character.id,
    }
  }),
)

const deindexIndexedObjects = (indexedObjects, newPropName) =>
  R.pipe(
    R.toPairs,
    R.map(([index, elements]) =>
      R.toPairs(elements).map(([type, element]) => ({
        ...element,
        type,
        [newPropName]: index,
      })),
    ),
    R.flatten,
  )(indexedObjects)

const mapMultiple = (matcherFunction, mapper, arrayOfCollections) => {
  const result = []
  const indexSlots = countUp(arrayOfCollections.map(R.pipe(R.length, R.add(-1))))
  const numberOfIteractions = R.pipe(
    R.map(R.length),
    R.reduce(R.multiply, 1),
  )(arrayOfCollections)
  for (let i = 0; i < numberOfIteractions; i++, indexSlots) {
    const indexes = indexSlots.next().value
    const elements = arrayOfCollections.map((collectionN, index) =>
      collectionN[indexes[index]],
    )
    const matchedElements = matcherFunction(elements)
    if (matchedElements) {
      result.push(mapper(elements))
    }
  }

  return result
}

const hasDuplicates = (aArray) =>
  aArray.length !== R.uniq(aArray).length

module.exports = {
  writeFilePromise,
  readFilePromise,
  isNumeric,
  fromNaturalLanguage,
  toSnakeCase,
  elementWithId,
  relateCommandToCharacter,
  deindexIndexedObjects,
  mapMultiple,
  hasDuplicates,
}