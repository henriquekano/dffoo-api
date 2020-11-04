module.exports = async (passives, gears) => {
  const gearPassives = gears.map((gear) => ({
    type: `gear-${gear.type}`,
    character_slug: gear.character_slug,
    characterId: gear.characterId,
    ...gear.passive,
  }))
  return [
    ...passives,
    ...gearPassives,
  ]
}
