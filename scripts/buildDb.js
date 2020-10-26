const R = require('ramda')
const banners = require('../banners.json')
const currentDb = require('../db.json')
const weaponLevels = require('../dictionaries/weaponLevels.json')
const { writeFilePromise } = require('./helpers')

// Phase 1 - extract/fetch
const extractAltema = require('./extractAltema')
const extract = require('./extract')
const sheets = require('./sheets')
const lufeniaExtract = require('./lufeniaExtract')

// Phase 2 - format
const alterBanners = require('./alterBanners')
const formatLufenia = require('./formatLufenia')

// Final Phase - write db.json
const format = require('./format');

(async () => {
  try {
    const [
      { version: altemaVersion, result: altemaStuff },
      { version: dbVersion, ...dbStuff },
      { version: monsterLocatorVersion, result: monsterLocatorStuff },
      { version: lufeniaDbVersion, result: lufeniaDbStuff },
    ] = await Promise.all([
      extractAltema(),
      extract(),
      sheets(),
      lufeniaExtract(),
    ])

    const formattedBanners = await alterBanners({
      banners: altemaStuff,
      characters: dbStuff.characters,
      gears: dbStuff.gears,
      prodBanners: banners,
      weaponLevels,
    })
    const formattedLufeniaStuff = await formatLufenia(dbStuff.enemies.enemies, lufeniaDbStuff)
    const formattedDb = await format({
      currentDb,
      missions: monsterLocatorStuff,
      banners: formattedBanners,
      ...dbStuff,
      versions: {
        db: dbVersion,
        altema: altemaVersion,
        monsterLocator: monsterLocatorVersion,
        lufeniaDb: lufeniaDbVersion,
      },
    })

    const db = {
      ...formattedDb,
      lufenia_enemies: formattedLufeniaStuff,
    }
    await writeFilePromise('db.json', JSON.stringify(db))
  } catch (err) {
    console.error('Something wrong', err.stack)
    process.exit(1)
  }
})()
