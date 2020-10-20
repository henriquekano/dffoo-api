const banners = require('../banners.json')
const currentDb = require('../db.json')
const weaponLevels = require('../dictionaries/weaponLevels.json')
const { writeFilePromise } = require('./helpers')

// Phase 1 - extract/fetch
const extractAltema = require('./extractAltema')
const extract = require('./extract')
const sheets = require('./sheets');

// Phase 2 - format
const alterBanners = require('./alterBanners')

// Final Phase - write db.json
const format = require('./format');

(async () => {
  try {
    const [
      { version: altemaVersion, result: altemaStuff },
      { version: dbVersion, ...dbStuff },
      { version: monsterLocatorVersion, result: monsterLocatorStuff },
    ] = await Promise.all([
      extractAltema(),
      extract(),
      sheets(),
    ])
    const formattedBanners = await alterBanners({
      banners: altemaStuff,
      characters: dbStuff.characters,
      gears: dbStuff.gears,
      prodBanners: banners,
      weaponLevels,
    })

    // await writeFilePromise('db2.json', JSON.stringify({
    //   missions: monsterLocatorStuff,
    //   banners: formattedBanners,
    //   ...dbStuff,
    // }, null, 2))
    const db = await format({
      currentDb,
      missions: monsterLocatorStuff,
      banners: formattedBanners,
      ...dbStuff,
      versions: {
        db: dbVersion,
        altema: altemaVersion,
        monsterLocator: monsterLocatorVersion,
      },
    })
    await writeFilePromise('db.json', JSON.stringify(db))
  } catch (err) {
    console.error('Something wrong', err.stack)
    process.exit(1)
  }
})()
