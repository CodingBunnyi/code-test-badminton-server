// calculate player results, including match outcomes and next round pairs
function getResult(inputData) {
  const { round1Data, round2Data } = inputData;
  let matches = [...round1Data, ...round2Data];
  const playerMatchMap = new Map();

  matches = calculateMatchResults(matches, playerMatchMap);
  const playerInfo = mergePlayerInfo(matches);
  const playerInfoMap = createPlayerInfoMap(playerInfo);
  const result = Array.from(playerInfoMap, ([name, value]) => ({ name, ...value }))
  const sortedResult = sortResult(result)
  const pairResult =  calculatePairResult(sortedResult, playerMatchMap)

  return { sortedResult, pairResult };
}

// calculate match results and update playerMatchMap
function calculateMatchResults(matches, playerMatchMap) {
  return matches.map(({ players }) => {
    const [player1, player2] = players;
    const scoreDiff = player1.score - player2.score;
    player1.win = scoreDiff > 0 ? 1 : 0;
    player2.win = scoreDiff < 0 ? 1 : 0;
    player1.scoreDiff = scoreDiff;
    player2.scoreDiff = -scoreDiff;

    updatePlayerMatchMap(playerMatchMap, player1.name, player2.name);

    return { players };
  });
}

// merge player information from matches
function mergePlayerInfo(matches) {
  const matchPlayers = matches.map(({ players }) => players).flat();
  return matchPlayers;
}

// create a playerInfoMap to store pPoint and sPoint of each player
function createPlayerInfoMap(playerInfo) {
  const playerInfoMap = new Map();
  for (const player of playerInfo) {
    const { name, win, scoreDiff } = player;
    const existingInfo = playerInfoMap.get(name) || { pPoint: 0, sPoint: 0 };
    playerInfoMap.set(name, { pPoint: existingInfo.pPoint + win, sPoint: existingInfo.sPoint + scoreDiff });
  }
  return playerInfoMap;
}

// update playerMatchMap with a new match entry
function updatePlayerMatchMap(playerMatchMap, playerName1, playerName2) {
  updatePlayerMatchMapEntry(playerMatchMap, playerName1, playerName2);
  updatePlayerMatchMapEntry(playerMatchMap, playerName2, playerName1);
}

// update a single entry in playerMatchMap
function updatePlayerMatchMapEntry(playerMatchMap, playerName, opponentName) {
  if (playerMatchMap.has(playerName)) {
    playerMatchMap.get(playerName).add(opponentName);
  } else {
    playerMatchMap.set(playerName, new Set([opponentName]));
  }
}

// sort the results and add the rank
function sortResult(result) {
  let sortedResult = result.sort((a, b) => {
    if (a.pPoint !== b.pPoint) {
      return b.pPoint - a.pPoint;
    }
    return b.sPoint - a.sPoint;
  })

  let currentRank = 1;
  let currentPPoint = sortedResult[0].pPoint;
  let currentSPoint = sortedResult[0].sPoint;

  // deal with equal ranks
  sortedResult.forEach((item, index) => {
    if (item.pPoint !== currentPPoint || item.sPoint !== currentSPoint) {
      currentRank = index + 1;
      currentPPoint = item.pPoint
      currentSPoint = item.sPoint
    }
    item.rank = currentRank;
  });
  return sortedResult
}


// calculate the next round pairs
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