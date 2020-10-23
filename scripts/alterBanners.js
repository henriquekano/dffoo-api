const R = require('ramda')
const {
  relateCommandToCharacter,
  deindexIndexedObjects,
  mapMultiple,
  hasDuplicates,
} = require('./helpers')
// const prodBanners = require('../banners.json')
// const banners = require('../altema_banners.json')
// const gears = require('../gears.json')
// const characters = require('../characters.json')
// const weaponLevels = require('../dictionaries/weaponLevels.json')

/** constants { */
const altemaNameVsDbName = {
  癒やしの杖: '癒しの杖【IV】',
  サーキュラーコア: 'サーキュラー・コア【IX】',
  'Aアーム&ガジェットナイフ': 'Aアーム＆ガジェットナイフ【WO】',
  'デルクフ・ガラディン': 'デルクフ・ガラティン【XI】',
  アイスブラント: 'アイスブランド【IX】',
  'ゴッドハンド&グラディウス': 'ゴッドハンド＆グラディウス【WO】',
  'ミスリルクロー&ミスリルナイフ': 'ミスリルクロー＆ミスリルナイフ【WO】',
  スカルススデンス: 'スカルスデンス【X】',
  'ディフェンダー【Ⅻ】': 'ディフェンダー【XII】',
  'バスターソードVer.Z': 'バスターソードver.Z【VII】',
  ミスライトレイピル: 'ミスライトレイピア【XIV】',
  イディルレイピル: 'イディルレイピア【XIV】',
  エアステアップソード: 'エアステップソード【XV】',
  へリッシュクロウ: 'ヘリッシュクロウ【XIV】',
  サイプレパイル: 'サイプレスパイル【IX】',
  オルハリコン: 'オリハルコン【V】',
  カルバディアマシンガン: 'ガルバディアマシンガン【VIII】',
  フレイムソードソード: 'フレイムソード【I】',
  'カエルラダガ-': 'カエルラダガー【零式】',
  ケーヒニスナックル: 'ケーニヒスナックル【XI】',
  スカイラッシャー: 'スカイスラッシャー【XIII】',
  ルーンスタッフ評価: 'ルーンスタッフ【XI】',
  スデンス: 'スカルスデンス【X】',
  'ディフェンダー【T】': 'ディフェンダー【T】',
  Ｗマシンガン: 'Wマシンガン【VII】',
}

const altemaCharacterNameVsDbName = {
  WOL: 'ウォーリア オブ ライト',
  パラディンセシル: 'セシル・ハーヴィ（パラディン）',
  ケットシー: 'ケット・シー',
  'ラァン&レェン': 'ラァン ＆ レェン',
}

const altemaWeaponIdVsDbWeapon = {
  634: {
    character: 'bartz',
    type: 'burstWeapon',
  },
  635: {
    character: 'bartz',
    type: 'limitedWeapon',
  },
  636: {
    character: 'galuf',
    type: 'limitedWeapon',
  },
  637: {
    character: 'palom',
    type: 'limitedWeapon',
  },
  638: {
    character: 'tifa',
    type: 'limitedWeapon',
  },
}
/** } */

/** Helpers { */
const characterNamesMatches = R.curry((dbName, altemaName) =>
  altemaCharacterNameVsDbName[altemaName] === dbName
  || dbName.startsWith(altemaName)
  || dbName.endsWith(altemaName),
)

const weaponNamesMatches = R.curry((dbName, altemaName) =>
  altemaNameVsDbName[altemaName] === dbName
  || dbName.startsWith(altemaName)
  || dbName.endsWith(altemaName),
)
/** } */

module.exports = async ({
  prodBanners,
  banners,
  gears,
  characters,
  weaponLevels,
}) => {
  const formattedGears = relateCommandToCharacter(
    deindexIndexedObjects(gears, 'character_slug'),
    characters,
  )

  const gearsJoinedWithCharacter = formattedGears.map(gear => ({
    ...gear,
    character: characters.find(R.propEq('slug', gear.character_slug)),
  }))

  const formattedBAnners = banners.banners
    .map((banner) => ({
      ...banner,
      characters: R.pipe(
        // map to "altema weapons"
        R.map((weaponId) => banners
          .weapons.filter(R.propEq('weaponId', weaponId))),
        R.flatten,
        R.map((altemaWeapon) => {
          const dbGearFound = gearsJoinedWithCharacter.find((dbGear) =>
            characterNamesMatches(dbGear.character.profile.fullName.jp, altemaWeapon.characterName)
            && weaponNamesMatches(dbGear.name.jp, altemaWeapon.weaponName),
          )
          if (dbGearFound) {
            return {
              character: dbGearFound.character_slug,
              type: weaponLevels[dbGearFound.type],
            }
          }

          const manualSettedGears = altemaWeaponIdVsDbWeapon[altemaWeapon.weaponId]
          if (manualSettedGears) {
            return manualSettedGears
          }

          console.warn('weapon not found:', altemaWeapon)
          process.exit(1)
          // const character = characters.find(aCharacter =>
          //   characterNamesMatches(
          //     aCharacter.profile.fullName.jp,
          //     altemaWeapon.characterName,
          //   ),
          // )
          // return {
          //   character: character.slug,
          //   type: '???',
          // }
        }),
        R.groupBy(R.prop('type')),
        R.toPairs,
        R.map(
          R.over(
            R.lensIndex(1),
            R.pipe(
              R.map(R.prop('character')),
              R.uniq,
            ),
          ),
        ),
        R.fromPairs,
      )(banner.weaponIds),
    }))
    // TODO - gonna take into consideration only the first ardyn banner forward
    // * avoid banner duplication by name
    .filter(R.pipe(
      R.prop('id'),
      Number,
      id => id > 351,
    ))

  const prodHasDuplicateBanners = hasDuplicates(prodBanners.map(R.path(['title', 'jp'])))
  const extractedBannersHasDuplicates = hasDuplicates(formattedBAnners.map(R.prop('title')))
  if (prodHasDuplicateBanners) {
    throw new Error('Duplicate Banners in prod :(')
  }
  if (extractedBannersHasDuplicates) {
    throw new Error('Duplicate Banners in altema :(')
  }

  const includeExtractedBannerData = (aBannerArray) =>
    mapMultiple(
      // matcher
      ([extractedBanner, prodBanner]) =>
        extractedBanner.id === prodBanner.id,
      ([extractedBanner, prodBanner]) => ({
        ...prodBanner,
        id: extractedBanner.id,
        ...extractedBanner.characters,
      }),
      [formattedBAnners, aBannerArray],
    )

  return includeExtractedBannerData(prodBanners)
}
