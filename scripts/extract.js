const R = require("ramda")
const fetch = require("node-fetch")
const fs = require("fs")
const { writeFilePromise } = require('./helpers')

// eslint-disable-next-line no-unused-vars
const webpackJsonp = (...args) => args[1]

const _getMinifiedDataKey = (evaledJsFile, key) => {
  const secondParameter = evaledJsFile
  const keyFunction = secondParameter[key]

  const e = {}
  const t = {}
  keyFunction(e, t)

  return e.exports
}

const _getRawGears = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "pZ10")
const _getCurrentEvents = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "pZ10")
const _getPassives = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "1JuO")
const _getItems = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "2ANq")
const _getEvents = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "AMku")
const _getCommandAbilities = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "ICfV")
const _getGenericStatus = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "XfgP")
const _getSpheres = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "dTie")
const _getBloomPassives = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "jMv9")
const _getSummonBoardNodes = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "mDHU")
const _getCharacters = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "qyXR")
const _getCharactersBoardNodes = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, "vsua")
const _getQuests = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "wie4")
const _getSummons = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "yBEX")
const _getEnums = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, "ryMj")

const fetchPageAndParse = async () => {
  const res = await fetch("https://dissidiadb.com")
  const resText = await res.text()
  const appJsEndpoint = resText.match(/\/static\/js\/app[^>]+/)

  const jsRes = await fetch(`https://dissidiadb.com${appJsEndpoint}`)
  const jsResText = await jsRes.text()
  const evaledJs = eval(jsResText)

  const gears = _getRawGears(evaledJs)
  const passives = _getPassives(evaledJs)
  const commands = _getCommandAbilities(evaledJs)
  const genericStatus = _getGenericStatus(evaledJs)
  const spheres = _getSpheres(evaledJs)
  const bloomPassives = _getBloomPassives(evaledJs)
  const characterBoards = _getCharactersBoardNodes(evaledJs)
  const characters = _getCharacters(evaledJs)
  const events = _getEvents(evaledJs)

  await Promise.all([
    writeFilePromise("gears.json", JSON.stringify(gears, null, 2)),
    writeFilePromise("passives.json", JSON.stringify(passives, null, 2)),
    writeFilePromise("commands.json", JSON.stringify(commands, null, 2)),
    writeFilePromise(
      "genericStatus.json",
      JSON.stringify(genericStatus, null, 2)
    ),
    writeFilePromise("spheres.json", JSON.stringify(spheres, null, 2)),
    writeFilePromise(
      "bloomPassives.json",
      JSON.stringify(bloomPassives, null, 2)
    ),
    writeFilePromise(
      "characterBoards.json",
      JSON.stringify(characterBoards, null, 2)
    ),
    writeFilePromise("characters.json", JSON.stringify(characters, null, 2)),
    writeFilePromise("events.json", JSON.stringify(events, null, 2)),
  ])
}

fetchPageAndParse()
