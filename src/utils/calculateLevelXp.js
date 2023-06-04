module.exports = function calculateLevelXp(level) {
  if (level <= 5) {
    return level * 100;
  } else if (level <= 15) {
    return 500 + (level - 5) * 10;
  } else {
    return 950 + (level - 15) * 5;
  }
}
