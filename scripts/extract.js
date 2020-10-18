/* eslint-disable no-underscore-dangle */
// const R = require('ramda')
const fetch = require('node-fetch')
// const fs = require('fs')
// const { writeFilePromise } = require('./helpers')

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

const _getRawGears = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'pZ10')
// const _getCurrentEvents = (evaledJsFile) =>
//   _getMinifiedDataKey(evaledJsFile, 'pZ10')
const _getCrystalPassives = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, '1JuO')
const _getArtifactPassives = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'O4Qb')
const _getCharacterBoardPassives = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'vsua')
// const _getItems = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, '2ANq')
const _getEvents = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'AMku')
const _getCommandAbilities = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'ICfV')
const _getGenericStatus = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'XfgP')
const _getSpheres = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'dTie')
const _getBloomPassives = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'jMv9')
const _getSummonBoardNodes = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'mDHU')
const _getCharacters = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'qyXR')
const _getCharactersBoardNodes = (evaledJsFile) =>
  _getMinifiedDataKey(evaledJsFile, 'vsua')
const _getQuests = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'wie4')
// const _getSummons = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'yBEX')
const _getEnums = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'ryMj')
const _getEnemies = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'eUsF')
const _getHereticEnemies = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'Fz9q')
const _getLunaticEnemies = (evaledJsFile) => _getMinifiedDataKey(evaledJsFile, 'E/MV')

module.exports = async () => {
  const res = await fetch('https://dissidiadb.com')
  const resText = await res.text()
  const appJsEndpoint = resText.match(/\/static\/js\/app[^>]+/)

  const jsRes = await fetch(`https://dissidiadb.com${appJsEndpoint}`)
  const jsResText = await jsRes.text()
  // eslint-disable-next-line no-eval
  const evaledJs = eval(jsResText)

  const gears = _getRawGears(evaledJs)
  const passives = _getCrystalPassives(evaledJs)
  const characterBoardPassives = _getCharacterBoardPassives(evaledJs)
  const artifactPassives = _getArtifactPassives(evaledJs)
  const commands = _getCommandAbilities(evaledJs)
  const genericStatus = _getGenericStatus(evaledJs)
  const spheres = _getSpheres(evaledJs)
  const bloomPassives = _getBloomPassives(evaledJs)
  const characterBoards = _getCharactersBoardNodes(evaledJs)
  const characters = _getCharacters(evaledJs)
  const events = _getEvents(evaledJs)
  const summonBoards = _getSummonBoardNodes(evaledJs)
  const enums = _getEnums(evaledJs)
  const quests = _getQuests(evaledJs)
  const enemies = {
    ..._getEnemies(evaledJs),
    enemies: [
      ..._getEnemies(evaledJs).enemies,
      ..._getLunaticEnemies(evaledJs),
      ..._getHereticEnemies(evaledJs),
    ],
  }

  return {
    gears,
    passives,
    artifactPassives,
    characterBoardPassives,
    commands,
    genericStatus,
    spheres,
    bloomPassives,
    characterBoards,
    characters,
    events,
    summonBoards,
    enums,
    quests,
    enemies,
  }

  // await Promise.all([
  //   writeFilePromise("gears.json", JSON.stringify(gears, null, 2)),
  //   writeFilePromise("passives.json", JSON.stringify(passives, null, 2)),
  //   writeFilePromise(
  //     "artifact_passives.json",
  //     JSON.stringify(artifactPassives, null, 2)
  //   ),
  //   writeFilePromise(
  //     "character_board_passives.json",
  //     JSON.stringify(characterBoardPassives, null, 2)
  //   ),
  //   writeFilePromise("commands.json", JSON.stringify(commands, null, 2)),
  //   writeFilePromise(
  //     "genericStatus.json",
  //     JSON.stringify(genericStatus, null, 2)
  //   ),
  //   writeFilePromise("spheres.json", JSON.stringify(spheres, null, 2)),
  //   writeFilePromise(
  //     "bloomPassives.json",
  //     JSON.stringify(bloomPassives, null, 2)
  //   ),
  //   writeFilePromise(
  //     "characterBoards.json",
  //     JSON.stringify(characterBoards, null, 2)
  //   ),
  //   writeFilePromise("characters.json", JSON.stringify(characters, null, 2)),
  //   writeFilePromise("events.json", JSON.stringify(events, null, 2)),
  //   writeFilePromise("summon_boards.json", JSON.stringify(summonBoards, null, 2)),
  //   writeFilePromise("enums.json", JSON.stringify(enums, null, 2)),
  //   writeFilePromise("quests.json", JSON.stringify(quests, null, 2)),
  //   writeFilePromise("enemies.json", JSON.stringify(enemies, null, 2)),
  // ])
}
