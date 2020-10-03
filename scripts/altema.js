const cheerio = require('cheerio')
const { readFilePromise, writeFilePromise } = require('./helpers')

  ; (async function () {
    const banners = await readFilePromise('./altema.html')
    const $ = cheerio.load(banners)
    const tables = $('.post table.tableLine tr,.post .acMenu tr')
    const bannerNames = tables.map((_, element) => {
      const title = $(element).find('td[style="text-align: center;"] a').parent().text()
      return title
    }).get().filter((title) => !!title).map((bannerName) => ({
      title: bannerName.replace(/^(.|\s)+>/, '').trim(),
    }))
    await writeFilePromise('banners.json', JSON.stringify(bannerNames, null, 2))
  })()
