const R = require("ramda")
const fs = require("fs")
const { writeFilePromise } = require('./helpers')

const commands = require("../commands.json")
const gears = require("../gears.json")
const characters = require("../characters.json")
const passives = require("../passives.json")
const spheres = require("../spheres.json")
const missions = require("../missions.json")

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

const reid = (elements, sortPath) => {
  return R.pipe(R.sortBy(R.path(sortPath)), (sortedElements) =>
    sortedElements.map((element, sortIndex) => ({ ...element, id: sortIndex }))
  )(elements)
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

  ; (async function () {
    await writeFilePromise(
      "db.json",
      JSON.stringify({
        commands: relateCommandToCharacter(
          reid(deindexArray(commands, "character_slug"), ["name", "en"]),
          characters
        ),
        missions,
        passives: relateCommandToCharacter(
          reid(deindexArray(passives, "character_slug"), ["name", "en"]),
          characters
        ),
        spheres: relateCommandToCharacter(
          reid(deindex(spheres, "character_slug"), ["name", "en"]),
          characters
        ),
        gears: relateCommandToCharacter(
          reid(deindexIndexedObjects(gears, "character_slug"), ["name", "en"]),
          characters
        ),
        characters: characters,
      })
    )
  })()
