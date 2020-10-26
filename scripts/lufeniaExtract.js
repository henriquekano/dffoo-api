/* eslint-disable no-underscore-dangle */
const R = require('ramda')
const cheerio = require('cheerio')
const puppetter = require('puppeteer')
const { hashCode, mapMultiple } = require('./helpers');

module.exports = async () => {
  const browser = await puppetter.launch()
  const contentPromises = ['jp', 'en'].map(async (language) => {
    const page = await browser.newPage()
    await page.goto(`https://lufenia.dissidia.dev/${language}`)
    return page.content()
  })
  const [jpHtml, enHtml] = await Promise.all(contentPromises)
  await browser.close()

  const jsonfyProfile = $ => (_, profileElement) => {
    const profile$ = $(profileElement)
    const assetId = profile$
      .find('.picture > img[data-src]')
      .attr('data-src')
      .match(/(\d+)(?:.png)/)[1]
    const name = profile$.find('.fullName').text()
    const stats = profile$.find('.stats .name')
      .map((__, statElement) => ({
        value: $(statElement).find('.num').text(),
        name: $(statElement).find('span').not('.num').text() || 'chase',
      }))
      .get()
    const orbValues = profile$.find('.countNum .countValue')
      .map((__, orbValuesElement) =>
        $(orbValuesElement).text())
      .get()
    const debuffResists = profile$.find('.resistances > .ailments')
      .map((__, resistanceElement) => {
        const resistance$ = $(resistanceElement)
        return {
          value: resistance$.find('span').not('.ailment').text(),
          debuffs: resistance$.find('.ailment font')
            .map((___, ailmentElement) => {
              const ailment$ = $(ailmentElement)
              return ailment$.text()
            })
            .get(),
        }
      })
      .get()
    const orbConditions = profile$.find('.description.count > div')
      .map((__, orbConditionElement) =>
        $(orbConditionElement).text())
      .get()
    return {
      assetId,
      name,
      stats,
      orbValues,
      debuffResists,
      orbConditions,
    }
  }

  const jsonfied = R.applyTo([jpHtml, enHtml])(R.pipe(
    R.map((htlmString) => {
      const $ = cheerio.load(htlmString)
      return $('.profile')
        .map(jsonfyProfile($))
        .get()
    }),
    ([jpProfiles, enProfiles]) =>
      mapMultiple(
        ([object1, object2]) => object1.assetId === object2.assetId,
        ([jpObject, enObject]) => ({
          ...enObject,
          assetId: jpObject.assetId,
          name: {
            en: enObject.name,
            jp: jpObject.name,
          },
          orbConditions: {
            jp: jpObject.orbConditions,
            en: enObject.orbConditions,
          },
          debuffResists: {
            jp: jpObject.debuffResists,
            en: enObject.debuffResists,
          },
        }),
        [jpProfiles, enProfiles],
      ),
  ))

  return {
    result: jsonfied,
    version: hashCode(JSON.stringify(jsonfied)),
  }
}
