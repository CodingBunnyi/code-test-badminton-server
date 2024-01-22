function getResult(inputData) {
  const { result, playerMatchMap } = calculatePlayerResult(inputData)
  const sortedResult = sortResult(result)
  const pairResult = calculatePairResult(sortedResult, playerMatchMap)
  return { sortedResult, pairResult }
}

function calculatePlayerResult(inputData) {
  const { round1Data, round2Data } = inputData
  let matches = [...round1Data, ...round2Data]
  const playerMatchMap = new Map()
  // calculate the winner and score dif of each match
  matches = matches.map(match => {
    const player1 = match.players[0]
    const player2 = match.players[1]
    const scoreDiff = player1.score - player2.score
    player1.win = scoreDiff > 0 ? 1 : 0
    player2.win = scoreDiff < 0 ? 1 : 0
    player1.scoreDiff = scoreDiff
    player2.scoreDiff = -scoreDiff

    // save matched players
    if (playerMatchMap.has(player1.name)) {
      playerMatchMap.set(player1.name, playerMatchMap.get(player1.name).add(player2.name))
    } else {
      playerMatchMap.set(player1.name, new Set([player2.name]))
    }
    if (playerMatchMap.has(player2.name)) {
      playerMatchMap.set(player2.name, playerMatchMap.get(player2.name).add(player1.name))
    } else {
      playerMatchMap.set(player2.name, new Set([player1.name]))
    }
    return match
  })

  // merge player infos
  let matchPlayers = matches.map(match => match.players)
  const playerInfo = []
  for (const matchPlayer of matchPlayers) {
    playerInfo.push(...matchPlayer)
  }

  // create a playerInfoMap to store pPoint and sPoint of each player
  const playerInfoMap = new Map()
  for (const player of playerInfo) {
    playerInfoMap.set(player.name,
      {
        pPoint: playerInfoMap.has(player.name) ? (playerInfoMap.get(player.name).pPoint + player.win) : player.win,
        sPoint: playerInfoMap.has(player.name) ? (playerInfoMap.get(player.name).sPoint + player.scoreDiff) : player.scoreDiff,
      })
  }

  return {
    result: Array.from(playerInfoMap, ([name, value]) => ({ name, ...value })),
    playerMatchMap
  }
}

function sortResult(result) {
  let rank = 1
  let sortedResult = result.sort((a, b) => {
    if (a.pPoint !== b.pPoint) {
      return b.pPoint - a.pPoint;
    }
    return b.sPoint - a.sPoint;
  })
  sortedResult = sortedResult.map(result => ({...result, rank: rank++}))
  return sortedResult
}

function calculatePairResult(sortedResult, playerMatchMap) {
  // next round of matching results
  const matchPairs = [];
  // record players who have been matched
  const pairedPlayers = new Set()
  for (let i = 0; i < sortedResult.length; i++) {
    if (!pairedPlayers.has(i)) {
      // Select an opponent whose ranking difference from the current player is no more than 10
      // and who has not been paired or played against before.
      for (let j = i + 1; j < sortedResult.length; j++) {
        if (!pairedPlayers.has(j) &&
          Math.abs(sortedResult[i].rank - sortedResult[j].rank) <= 10 &&
          !playerMatchMap.get(sortedResult[i].name)?.has(sortedResult[j].name)
        ) {
          // add pairing information to the results array
          matchPairs.push({ player1: sortedResult[i].name, player2: sortedResult[j].name })
          // mark these two players as paired
          pairedPlayers.add(i);
          pairedPlayers.add(j);
          // break out of the inner loop after finding a suitable opponent
          break;
        }
      }
    }
  }
  return matchPairs
}

module.exports = {
  getResult,
};