const R = require("ramda")
const { writeFilePromise } = require('./helpers')

const commands = require("../commands.json")
const gears = require("../gears.json")
const characters = require("../characters.json")
const passives = require("../passives.json")
const spheres = require("../spheres.json")
const missions = require("../missions.json")
const banners = require("../banners.json")
const summonBoards = require("../summon_boards.json")
const enums = require("../enums.json")

const deindexArray = (indexedObjects, newPropName) => {
  return R.pipe(
    R.toPairs,
    R.map(([index, elements]) =>
      elements
        .filter((element) => R.type(element) === "Object")
        .map(R.set(R.lensProp(newPropName), index))
    ),
    R.flatten
  )(indexedObjects)
}

const deindex = (indexedObjects, newPropName) => {
  return R.pipe(
    R.toPairs,
    R.map(([index, element]) => ({
      ...element,
      [newPropName]: index,
    })),
    R.flatten
  )(indexedObjects)
}

const deindexIndexedObjects = (indexedObjects, newPropName) => {
  return R.pipe(
    R.toPairs,
    R.map(([index, elements]) =>
      R.toPairs(elements).map(([type, element]) => ({
        ...element,
        type,
        [newPropName]: index,
      }))
    ),
    R.flatten
  )(indexedObjects)
}

const elementWithId = (collection, id, defaultValue = '') => {
  return collection.find(R.propEq('id', id)) || defaultValue
}

const relateCommandToCharacter = (commands, characters) => {
  return commands.map((command) => {
    const character = R.filter(R.propEq("slug", command.character_slug))(
      characters
    )[0]
    return {
      ...command,
      characterId: character.id,
    }
  })
}

const addKeysToAFieldForQuery = (objects) => {
  return objects.map((object) => ({
    ...object,
    _meta_search: Object.keys(object).join(';')
  }))
}

  ; (async function () {
    await writeFilePromise(
      "db.json",
      JSON.stringify({
        commands: relateCommandToCharacter(
          deindexArray(commands, "character_slug").map((passive) => {
            return {
              ...passive,
              id: `${passive.character_slug}-${passive.name.jp}`,
              attr: {
                ...passive.attr,
                atk_attr: elementWithId(enums.attackTypes, passive.attr.atk_attr, { name: 'None' }).name,
                ele_attr: passive.attr.ele_attr.map((elementAttrIndex) => {
                  // not sure why, but the index is shifted by one
                  return elementWithId(enums.elements, elementAttrIndex - 1).name
                })
              }
            }
          }),
          characters
        ),
        missions: addKeysToAFieldForQuery(missions),
        passives: relateCommandToCharacter(
          deindexArray(passives, "character_slug").map((passive) => {
            return {
              ...passive,
              id: `${passive.character_slug}-${passive.name.jp}`
            }
          }),
          characters
        ),
        spheres: relateCommandToCharacter(
          deindex(spheres, "character_slug"),
          characters
        ),
        gears: relateCommandToCharacter(
          deindexIndexedObjects(gears, "character_slug"),
          characters
        ),
        characters: characters.map((character) => ({
          ...character,
          profile: {
            ...character.profile,
            world: elementWithId(enums.series, character.profile.world).name,
            crystal: elementWithId(enums.crystals, character.profile.crystal).name,
            weaponType: elementWithId(enums.weapons, character.profile.weaponType).name,
          }
        })),
        banners,
        summon_boards: summonBoards
      })
    )
  })()
