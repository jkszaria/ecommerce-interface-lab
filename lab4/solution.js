function getTopScorers(playerList) {
    return playerList
        .filter(p => p.score > 8)
        .map(p => p.name)
        .join(", ");
}