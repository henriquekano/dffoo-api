const R = require('ramda')
const { propsEq } = require('./helpers')

module.exports = async (enemyBases, lufeniaEnemies) =>
  R.applyTo(lufeniaEnemies)(
    R.pipe(
      R.innerJoin(propsEq('assetId'), R.__, enemyBases),
      R.map((lufeniaEnemy) => ({
        id: `${lufeniaEnemy.assetId}-${lufeniaEnemy.name.jp}`,
        ...lufeniaEnemy,
      })),
    ),
  )
