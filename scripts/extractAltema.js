const R = require('ramda')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const { writeFilePromise } = require('./helpers');

(async function main() {
  let idNotFoundIndex = 0
  const altemaBannersPage = await fetch('https://altema.jp/dffoo/gachamemorialhall-2-7012')
  const banners = await altemaBannersPage.text()
  const $ = cheerio.load(banners)
  const tables = $('.post table.tableLine tr,.post .acMenu tr')
  const bannerNames = tables
    .filter((_, element) => {
      const title = $(element).find('td[style="text-align: center;"] a').parent().text()
      return !!title
    })
    .map((_, element) => {
      const title = $(element).find('td[style="text-align: center;"] a').text()
        .replace(/^(.|\s)+>/, '')
        .trim()
      // weapons
      const weaponElements = $(element).find('li a')
        .filter((__, weaponElement) => {
          const hasTheTitleElement = !!weaponElement
            && !!weaponElement.firstChild
            && !!weaponElement.firstChild.data
          return hasTheTitleElement
        })
        .filter((__, weaponElement) => {
          const weaponName = weaponElement.firstChild.data
          return !weaponName.includes('ガチャシミュ')
        })
      const weapons = weaponElements
        .map((__, weaponElement) => {
          if (!weaponElement || !weaponElement.firstChild) {
            return ''
          }
          return weaponElement.firstChild.data
        }).get()
      const weaponIds = weaponElements
        .map((__, weaponElement) => {
          if (!weaponElement || !weaponElement.firstChild) {
            return ''
          }
          return $(weaponElement.firstChild.parent).attr('href').match(/\d+$/)[0]
        }).get()
      if (weapons.length !== weaponIds.length) {
        console.warn('didn\'t find all the ids or the weapons', {
          weapons: weapons.length,
          weaponIds: weaponIds.length,
        })
        throw Error('didn\'t find all the ids or the weapons')
      }

      // id
      let id = $(element).find('a[href^="/dffoo/gacha/"]').attr('href')
      if (!id) {
        console.warn(`didn't find id: ${title}, ${weapons}`)
        id = '/dffoo/gacha/-1'
        idNotFoundIndex++
      }
      id = id.replace(/\/dffoo\/gacha\//, '')
        .trim()

      if (idNotFoundIndex > 1) {
        throw new Error('Too many unknown ids')
      }

      return {
        id,
        title,
        weapons: R.reject(R.isEmpty, weapons),
        weaponIds,
      }
    })
    .get()

  const weaponVsCharacterNamePage = await fetch('https://altema.jp/dffoo/bukilist')
  const weaponVsCharacterName = await weaponVsCharacterNamePage.text()
  const $2 = cheerio.load(weaponVsCharacterName)
  const weaponCharacterTables = $2('tr')
    .filter((_, element) =>
      $2(element).find('a[href^="/dffoo/buki/"]').length > 0,
    )
    .map((_, element) => {
      const links = $2(element).find('a')
      const weaponName = links.first().text().trim()
      const weaponId = links.first().attr('href').match(/\d+$/)[0]
      const characterName = links.last().text().trim()
      return {
        weaponName,
        weaponId,
        characterName: weaponName === characterName
          ? ''
          : characterName,
      }
    }).get()

  await writeFilePromise('altema_banners.json', JSON.stringify({
    banners: bannerNames,
    weapons: weaponCharacterTables,
  }, null, 2))
}())
