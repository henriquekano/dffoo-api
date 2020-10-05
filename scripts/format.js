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
const events = require("../events.json")
const enemies = require("../enemies.json")

const addKey = R.curry((keyName, valueOrFunction, object) => {
  if (R.type(valueOrFunction) === 'Function') {
    return ({ ...object, [keyName]: valueOrFunction(object) })
  }
  return ({ ...object, [keyName]: valueOrFunction })
})

const renameKeys = R.curry((keysMap, obj) =>
  R.reduce((acc, key) =>
    R.assoc(R.type(keysMap[key]) === 'Function'
      ? keysMap[key](key, obj)
      : (keysMap[key] || key),
      obj[key],
      acc),
    {},
    R.keys(obj)
  )
)

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
        missions: missions
          .map((mission) => {
            const commonKeys = ['id', 'quest_name', 'location', 'difficulty', 'waves']
            const monsterNames = Object.keys(mission).reduce((acc, missionKey) => {
              if (!commonKeys.includes(missionKey)) {
                return [
                  ...acc,
                  missionKey
                ]
              }
              return acc
            }, [])
            return {
              ...mission,
              monsters: monsterNames,
            }
          }),
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
        events: Object.keys(events).reduce((acc, eventType) => {
          if (eventType === 'burstSynergy') {
            return acc
          }
          const eventsOfType = events[eventType]
            .map(R.pipe(
              addKey('type', eventType),
              renameKeys({
                id: (key, object) => {
                  if ('id' in object) {
                    return object.type + 'Id'
                  }
                  return key
                }
              }),
              addKey('id', (object) =>
                `${object.type}-${object.name || object.title.jp}`
              ),
              renameKeys({ chara: 'synergy_characters', glChara: 'gl_synergy_characters' })
            ))
          return [...acc, ...eventsOfType]
        }, []),
        summon_boards: summonBoards,
        enemies: enemies.enemies.map((enemy) => ({
          ...enemy,
          traits: {
            ...enemy.traits,
            type: enemies.enemyTypes[enemy.traits.type - 1],
          },
          resist: {
            ...enemy.resist,
            atk: enemy.resist.atk.map((atkResistenceValue, atkTypeIndex) => {
              const atkType = elementWithId(enums.attackTypes, atkTypeIndex + 1)
              const resistanceValue = elementWithId(enums.resistanceTypes, atkResistenceValue)
              return {
                atk_type: atkType.name,
                value: resistanceValue.name,
                symbol: resistanceValue.term,
              }
            })
              .reduce((acc, atkType) => {
                return {
                  ...acc,
                  [atkType.atk_type]: atkType.value,
                }
              }, {}),
            ele: enemy.resist.ele.map((elementResistenceValue, elementypeIndex) => {
              const element = elementWithId(enums.elements, elementypeIndex + 1)
              const resistanceValue = elementWithId(enums.resistanceTypes, elementResistenceValue)
              return {
                element: element.name,
                value: resistanceValue.name,
                symbol: resistanceValue.term,
              }
            })
              .reduce((acc, element) => {
                return {
                  ...acc,
                  [element.element]: element.value,
                }
              }, {}),
            ail: {
              ...enemy.resist.ail,
              weak: enemy.resist.ail.weak.map((value) => {
                return enemies.ailmentResistNames[value - 1]
              }).flatMap((ail) => [ail.en, ail.gl])
                .filter((e) => e !== ''),
              resistant: enemy.resist.ail.resistant.map((value) => {
                return enemies.ailmentResistNames[value - 1]
              }).flatMap((ail) => [ail.en, ail.gl])
                .filter((e) => e !== ''),
              immune: enemy.resist.ail.immune.map((value) => {
                return enemies.ailmentResistNames[value - 1]
              }).flatMap((ail) => [ail.en, ail.gl])
                .filter((e) => e !== ''),
            }
          }
        })),
      })
    )
  })()
