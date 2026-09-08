import type { 
  Player, 
  UpcomingFixture, 
  TeamFixturePlanner, 
  FixturePlannerResponse, 
  FixtureRunAlert, 
  TransferTarget, 
  CaptainCandidate, 
  ComparisonResult, 
  ComparisonMatrixItem, 
  MyTeamResponse, 
  EnrichedSquadPlayer, 
  PlayerActionVerdict, 
  OptimalSquadResponse, 
  PlayerSelectionReason 
} from '../types';

const ELEMENT_TYPES: Record<number, string> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD'
};

function getPhotoUrl(photoStr: string, size: string = '110x140'): string {
  if (!photoStr) return '';
  const code = photoStr.replace('.jpg', '').replace('.png', '');
  return `https://resources.premierleague.com/premierleague/photos/players/${size}/p${code}.png`;
}

function getShirtUrl(teamCode: number | undefined, elType: number): string {
  if (!teamCode) return '';
  const suffix = elType === 1 ? '_1-66.png' : '-66.png';
  return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}${suffix}`;
}

function getTeamBadgeUrl(teamCode: number | undefined): string {
  if (!teamCode) return '';
  return `https://resources.premierleague.com/premierleague/badges/70/t${teamCode}.png`;
}

export function calcTeamUpcomingFdr(
  teams: any[],
  fixtures: any[],
  currentGw: number
): Record<number, TeamFixturePlanner> {
  const result: Record<number, TeamFixturePlanner> = {};
  const teamsMap: Record<number, string> = {};
  const teamsShortMap: Record<number, string> = {};
  const teamsCodeMap: Record<number, number> = {};

  for (const t of teams) {
    teamsMap[t.id] = t.name;
    teamsShortMap[t.id] = t.short_name || t.name.substring(0, 3).toUpperCase();
    teamsCodeMap[t.id] = t.code;
  }

  const upcoming = fixtures.filter(
    (f) => !f.finished && f.event !== null && f.event >= currentGw
  );

  for (const t of teams) {
    const tId = t.id;
    const tCode = t.code;
    const tFixtures: UpcomingFixture[] = [];

    for (const f of upcoming) {
      if (f.team_h === tId) {
        const oppId = f.team_a;
        const oppCode = teamsCodeMap[oppId];
        tFixtures.push({
          event: f.event,
          opponent_id: oppId,
          opponent_name: teamsMap[oppId] || `Team ${oppId}`,
          opponent_short: teamsShortMap[oppId] || 'UNK',
          opponent_code: oppCode,
          opponent_shirt_url: getShirtUrl(oppCode, 2),
          opponent_badge_url: getTeamBadgeUrl(oppCode),
          is_home: true,
          difficulty: f.team_h_difficulty ?? 3
        });
      } else if (f.team_a === tId) {
        const oppId = f.team_h;
        const oppCode = teamsCodeMap[oppId];
        tFixtures.push({
          event: f.event,
          opponent_id: oppId,
          opponent_name: teamsMap[oppId] || `Team ${oppId}`,
          opponent_short: teamsShortMap[oppId] || 'UNK',
          opponent_code: oppCode,
          opponent_shirt_url: getShirtUrl(oppCode, 2),
          opponent_badge_url: getTeamBadgeUrl(oppCode),
          is_home: false,
          difficulty: f.team_a_difficulty ?? 3
        });
      }
    }

    tFixtures.sort((a, b) => a.event - b.event);
    const next5 = tFixtures.slice(0, 5);
    const avgFdr = next5.length
      ? parseFloat((next5.reduce((sum, fx) => sum + fx.difficulty, 0) / next5.length).toFixed(2))
      : 3.0;

    result[tId] = {
      team_id: tId,
      team_name: t.name,
      team_short: teamsShortMap[tId] || 'UNK',
      team_code: tCode,
      shirt_url: getShirtUrl(tCode, 2),
      badge_url: getTeamBadgeUrl(tCode),
      avg_fdr: avgFdr,
      fixtures: next5
    };
  }

  return result;
}

export function processPlayers(
  rawPlayers: any[],
  rawTeams: any[],
  rawFixtures: any[],
  currentGw: number = 1
): Player[] {
  if (!rawPlayers || rawPlayers.length === 0) return [];

  const teamsMap: Record<number, string> = {};
  const teamsShortMap: Record<number, string> = {};
  for (const t of rawTeams) {
    teamsMap[t.id] = t.name;
    teamsShortMap[t.id] = t.short_name || t.name.substring(0, 3).toUpperCase();
  }

  const teamFdrMap = calcTeamUpcomingFdr(rawTeams, rawFixtures, currentGw);

  return rawPlayers.map((p) => {
    const price = parseFloat((p.now_cost / 10.0).toFixed(1));
    const teamName = teamsMap[p.team] || 'Unknown';
    const teamShort = teamsShortMap[p.team] || 'UNK';
    const positionName = ELEMENT_TYPES[p.element_type] || 'UNK';

    const photoUrl = getPhotoUrl(p.photo, '110x140');
    const photoUrlLg = getPhotoUrl(p.photo, '250x250');
    const shirtUrl = getShirtUrl(p.team_code, p.element_type);

    const totalPoints = parseFloat(p.total_points) || 0;
    const form = parseFloat(p.form) || 0.0;
    const selectedByPercent = parseFloat(p.selected_by_percent) || 0.0;
    const pointsPerGame = parseFloat(p.points_per_game) || 0.0;
    const ictIndex = parseFloat(p.ict_index) || 0.0;
    const transfersInEvent = parseInt(p.transfers_in_event, 10) || 0;
    const transfersOutEvent = parseInt(p.transfers_out_event, 10) || 0;
    const minutes = parseInt(p.minutes, 10) || 0;
    const goalsScored = parseInt(p.goals_scored, 10) || 0;
    const assists = parseInt(p.assists, 10) || 0;
    const cleanSheets = parseInt(p.clean_sheets, 10) || 0;
    const bonus = parseInt(p.bonus, 10) || 0;

    const valueScore = price > 0 ? parseFloat((totalPoints / price).toFixed(2)) : 0.0;
    const formScore = form;

    const totalPossibleMins = Math.max(currentGw * 90, 90);
    const minsRatio = Math.min(Math.max(minutes / totalPossibleMins, 0.0), 1.0);
    const consistencyScore = parseFloat(
      Math.min(Math.max(pointsPerGame * 0.7 + minsRatio * 3.0, 0.0), 10.0).toFixed(1)
    );

    const minsPerGw = minutes / Math.max(currentGw, 1);
    let rotationRisk: 'Low' | 'Medium' | 'High' = 'High';
    if (minsPerGw >= 65) rotationRisk = 'Low';
    else if (minsPerGw >= 35) rotationRisk = 'Medium';

    const fdrData = teamFdrMap[p.team];
    const upcomingFdr = fdrData ? fdrData.avg_fdr : 3.0;
    const upcomingFixtures = fdrData ? fdrData.fixtures : [];

    const rawTransferScore =
      formScore * 7.5 + (5.0 - upcomingFdr) * 8.0 + valueScore * 1.2 + minsRatio * 15.0;
    const transferScore = parseFloat(
      Math.min(Math.max(rawTransferScore, 0.0), 100.0).toFixed(1)
    );

    const rawCaptainScore =
      formScore * 9.0 + (5.0 - upcomingFdr) * 7.0 + ictIndex * 0.25 + minsRatio * 10.0;
    const captainScore = parseFloat(
      Math.min(Math.max(rawCaptainScore, 0.0), 100.0).toFixed(1)
    );

    const epNextVal = parseFloat(p.ep_next) || 0.0;
    const rawXp =
      epNextVal > 0
        ? epNextVal
        : formScore * 0.6 + (5.0 - upcomingFdr) * 0.4 + ictIndex * 0.02;
    const expectedPoints = parseFloat(Math.min(Math.max(rawXp, 0.0), 20.0).toFixed(1));

    const nineties = minutes >= 90 ? minutes / 90.0 : 0.0;
    const ictPer90 = nineties > 0 ? parseFloat((ictIndex / nineties).toFixed(2)) : 0.0;
    const attackingReturns = goalsScored + assists;
    const returnsPer90 =
      nineties > 0 ? parseFloat((attackingReturns / nineties).toFixed(2)) : 0.0;
    const bonusPer90 = nineties > 0 ? parseFloat((bonus / nineties).toFixed(2)) : 0.0;
    const netTransfersGw = transfersInEvent - transfersOutEvent;

    const setPieceRoles: string[] = [];
    if (p.penalties_order === 1) setPieceRoles.push('Penalties');
    if (p.direct_freekicks_order === 1 || p.direct_freekicks_order === 2)
      setPieceRoles.push('Free Kicks');
    if (
      p.corners_and_indirect_freekicks_order === 1 ||
      p.corners_and_indirect_freekicks_order === 2
    )
      setPieceRoles.push('Corners');
    const setPieceRole = setPieceRoles.length > 0 ? setPieceRoles.join(' & ') : 'None';

    return {
      id: p.id,
      web_name: p.web_name,
      first_name: p.first_name,
      second_name: p.second_name,
      team: p.team,
      team_name: teamName,
      team_short: teamShort,
      element_type: p.element_type,
      position_name: positionName,
      price,
      total_points: totalPoints,
      form_score: formScore,
      value_score: valueScore,
      consistency_score: consistencyScore,
      rotation_risk: rotationRisk,
      upcoming_fdr: upcomingFdr,
      upcoming_fixtures: upcomingFixtures,
      transfer_score: transferScore,
      captain_score: captainScore,
      selected_by_percent: selectedByPercent,
      goals_scored: goalsScored,
      assists,
      clean_sheets: cleanSheets,
      bonus,
      ict_index: ictIndex,
      minutes,
      expected_points: expectedPoints,
      ict_per_90: ictPer90,
      attacking_returns: attackingReturns,
      returns_per_90: returnsPer90,
      bonus_per_90: bonusPer90,
      net_transfers_gw: netTransfersGw,
      set_piece_role: setPieceRole,
      photo_url: photoUrl,
      photo_url_lg: photoUrlLg,
      shirt_url: shirtUrl
    };
  });
}

export function getFixturePlanner(
  teams: any[],
  fixtures: any[],
  currentGw: number = 1
): FixturePlannerResponse {
  const teamFdrs = calcTeamUpcomingFdr(teams, fixtures, currentGw);
  const planner: TeamFixturePlanner[] = [];
  const easyRuns: FixtureRunAlert[] = [];
  const hardRuns: FixtureRunAlert[] = [];

  for (const tId in teamFdrs) {
    const data = teamFdrs[tId];
    planner.push(data);
    const avg = data.avg_fdr;
    const tName = data.team_name;

    if (avg <= 2.6) {
      easyRuns.push({
        team_id: data.team_id,
        team_code: data.team_code,
        team_name: tName,
        shirt_url: data.shirt_url,
        badge_url: data.badge_url,
        avg_fdr: avg,
        reason: `${tName} has one of the easiest fixture runs over the next 5 Gameweeks (Avg FDR ${avg}).`
      });
    } else if (avg >= 3.8) {
      hardRuns.push({
        team_id: data.team_id,
        team_code: data.team_code,
        team_name: tName,
        shirt_url: data.shirt_url,
        badge_url: data.badge_url,
        avg_fdr: avg,
        reason: `${tName} faces a tough schedule over the next 5 Gameweeks (Avg FDR ${avg}).`
      });
    }
  }

  planner.sort((a, b) => a.avg_fdr - b.avg_fdr);
  easyRuns.sort((a, b) => a.avg_fdr - b.avg_fdr);
  hardRuns.sort((a, b) => b.avg_fdr - a.avg_fdr);

  return {
    current_gameweek: currentGw,
    planner,
    easy_runs: easyRuns,
    hard_runs: hardRuns
  };
}

export function getTransferTargets(
  processedPlayers: Player[],
  topN: number = 10
): TransferTarget[] {
  const valid = processedPlayers.filter((p) => p.minutes > 60);
  valid.sort((a, b) => b.transfer_score - a.transfer_score);

  const sliced = valid.slice(0, topN);
  return sliced.map((p, index) => {
    const reasons: string[] = [];
    if (p.form_score >= 5.0) reasons.push(`Strong recent form (${p.form_score} pts/GW)`);
    if (p.upcoming_fdr <= 2.7) reasons.push(`Favorable upcoming fixtures (Avg FDR ${p.upcoming_fdr})`);
    if (p.value_score >= 10.0) reasons.push(`Exceptional value score (${p.value_score} pts/£M)`);
    if (reasons.length === 0) reasons.push('Solid overall rating across minutes and returns');

    return {
      rank: index + 1,
      player: p,
      transfer_score: p.transfer_score,
      primary_reason: reasons[0],
      all_reasons: reasons
    };
  });
}

export function getCaptainRankings(
  processedPlayers: Player[],
  topN: number = 10
): CaptainCandidate[] {
  const valid = processedPlayers.filter((p) => p.minutes > 90);
  valid.sort((a, b) => b.captain_score - a.captain_score);

  const sliced = valid.slice(0, topN);
  return sliced.map((p, index) => ({
    rank: index + 1,
    player: p,
    captain_score: p.captain_score,
    rationale: `High attacking form (${p.form_score} pts/GW), reliable minutes (${p.rotation_risk} risk), and upcoming fixture FDR of ${p.upcoming_fdr}.`
  }));
}

export function getDifferentials(
  processedPlayers: Player[],
  maxOwnership: number = 10.0,
  topN: number = 10
): Player[] {
  const differentials = processedPlayers.filter(
    (p) => p.selected_by_percent < maxOwnership && p.minutes > 90
  );
  differentials.sort((a, b) => b.transfer_score - a.transfer_score);
  return differentials.slice(0, topN);
}

export function comparePlayers(p1: Player, p2: Player): ComparisonResult {
  let p1Score = 0;
  let p2Score = 0;

  const p1Fx = p1.upcoming_fixtures || [];
  const p2Fx = p2.upcoming_fixtures || [];

  const p1Next3 = p1Fx.slice(0, 3);
  const p2Next3 = p2Fx.slice(0, 3);

  const p1Fdr3 = p1Next3.length
    ? parseFloat((p1Next3.reduce((s, f) => s + f.difficulty, 0) / p1Next3.length).toFixed(2))
    : 3.0;
  const p2Fdr3 = p2Next3.length
    ? parseFloat((p2Next3.reduce((s, f) => s + f.difficulty, 0) / p2Next3.length).toFixed(2))
    : 3.0;

  const metrics: [keyof Player | 'fdr_3_gw', string, boolean][] = [
    ['total_points', 'Total Points', true],
    ['expected_points', 'xP (Expected Pts Next GW)', true],
    ['form_score', 'Recent Form (Pts/GW)', true],
    ['fdr_3_gw', 'Next 3 GWs Avg FDR (Lower is better)', false],
    ['upcoming_fdr', 'Next 5 GWs Avg FDR (Lower is better)', false],
    ['value_score', 'Value Score (Points/£)', true],
    ['transfer_score', 'Transfer Rating Score', true],
    ['captain_score', 'Captain Score', true],
    ['ict_per_90', 'ICT Index / 90 Mins', true],
    ['returns_per_90', 'Goal Involvements / 90 Mins', true],
    ['net_transfers_gw', 'GW Net Transfer Momentum', true],
    ['selected_by_percent', 'Ownership %', true]
  ];

  const comparisonMatrix: ComparisonMatrixItem[] = [];
  const p1Advantages: string[] = [];
  const p2Advantages: string[] = [];

  for (const [key, label, higherIsBetter] of metrics) {
    let v1 = key === 'fdr_3_gw' ? p1Fdr3 : (p1[key as keyof Player] as number) || 0;
    let v2 = key === 'fdr_3_gw' ? p2Fdr3 : (p2[key as keyof Player] as number) || 0;

    let winner: 'player1' | 'player2' | 'tie' = 'tie';
    if (higherIsBetter) {
      if (v1 > v2) winner = 'player1';
      else if (v2 > v1) winner = 'player2';
    } else {
      if (v1 < v2) winner = 'player1';
      else if (v2 < v1) winner = 'player2';
    }

    if (winner === 'player1') {
      p1Score += 1;
      p1Advantages.push(`${label}: ${v1} vs ${v2}`);
    } else if (winner === 'player2') {
      p2Score += 1;
      p2Advantages.push(`${label}: ${v2} vs ${v1}`);
    }

    comparisonMatrix.push({
      metric: label,
      player1_val: v1,
      player2_val: v2,
      winner
    });
  }

  const winnerPlayer = p1Score >= p2Score ? p1 : p2;
  const otherPlayer = p1Score >= p2Score ? p2 : p1;
  const verdictName = winnerPlayer.web_name;

  const reasons: string[] = [];
  const vFdr3 = winnerPlayer === p1 ? p1Fdr3 : p2Fdr3;
  const oFdr3 = winnerPlayer === p1 ? p2Fdr3 : p1Fdr3;

  if (vFdr3 < oFdr3) reasons.push(`an easier 3-GW fixture run (Avg FDR ${vFdr3} vs ${oFdr3})`);
  else if (vFdr3 === oFdr3) reasons.push(`matching 3-GW fixture FDR (${vFdr3})`);

  const vXp = winnerPlayer.expected_points || 0;
  const oXp = otherPlayer.expected_points || 0;
  if (vXp > oXp) reasons.push(`higher expected returns (${vXp} vs ${oXp} xP)`);

  const vForm = winnerPlayer.form_score || 0;
  const oForm = otherPlayer.form_score || 0;
  if (vForm > oForm) reasons.push(`stronger form (${vForm} vs ${oForm} pts/GW)`);

  const reasonStr = reasons.length > 0 ? reasons.join(', ') : 'superior underlying statistical metrics';
  const verdictText = `${verdictName} is the recommended pick (${Math.max(p1Score, p2Score)}/${metrics.length} categories won), powered by ${reasonStr}.`;

  return {
    player1: p1,
    player2: p2,
    winner_player: winnerPlayer,
    matrix: comparisonMatrix,
    winner_id: winnerPlayer.id,
    p1_advantages: p1Advantages,
    p2_advantages: p2Advantages,
    p1_fdr_3: p1Fdr3,
    p2_fdr_3: p2Fdr3,
    verdict: verdictText
  };
}

export function analyzeMyTeam(
  managerProfile: any,
  picksData: { picksData: any; gameweekFetched: number },
  processedPlayers: Player[]
): MyTeamResponse {
  const playersById: Record<number, Player> = {};
  for (const p of processedPlayers) {
    playersById[p.id] = p;
  }

  const firstName = managerProfile.player_first_name || '';
  const lastName = managerProfile.player_last_name || '';
  const managerName = `${firstName} ${lastName}`.trim() || managerProfile.name || 'FPL Manager';
  const teamName = managerProfile.name || 'FPL Squad';
  const overallRank = managerProfile.summary_overall_rank || 0;
  const overallPoints = managerProfile.summary_overall_points || 0;

  const picksRaw = picksData.picksData || {};
  const entryHist = picksRaw.entry_history || {};
  const bank = parseFloat(((entryHist.bank || 0) / 10.0).toFixed(1));
  const value = parseFloat(((entryHist.value || 1000) / 10.0).toFixed(1));

  const allPicks = picksRaw.picks || [];

  const squadPlayers: EnrichedSquadPlayer[] = [];
  const startingXi: EnrichedSquadPlayer[] = [];
  const bench: EnrichedSquadPlayer[] = [];

  for (const pPick of allPicks) {
    const pId = pPick.element;
    const pos = pPick.position || 1;
    const isCap = pPick.is_captain || false;
    const isVc = pPick.is_vice_captain || false;
    const multiplier = pPick.multiplier || 1;

    const baseP = playersById[pId] || {
      id: pId,
      web_name: `Player ${pId}`,
      first_name: '',
      second_name: '',
      team: 0,
      team_name: 'UNK',
      team_short: 'UNK',
      element_type: 1,
      position_name: 'GKP',
      price: 4.0,
      total_points: 0,
      form_score: 0,
      value_score: 0,
      consistency_score: 0,
      rotation_risk: 'Medium',
      upcoming_fdr: 3.0,
      upcoming_fixtures: [],
      transfer_score: 50,
      captain_score: 50,
      selected_by_percent: 0,
      goals_scored: 0,
      assists: 0,
      clean_sheets: 0,
      bonus: 0,
      ict_index: 0,
      minutes: 0
    };

    const enriched: EnrichedSquadPlayer = {
      ...baseP,
      pick_position: pos,
      is_captain: isCap,
      is_vice_captain: isVc,
      multiplier
    };

    squadPlayers.push(enriched);
    if (pos <= 11) {
      startingXi.push(enriched);
    } else {
      bench.push(enriched);
    }
  }

  const sortedSquadByCaptain = [...squadPlayers].sort(
    (a, b) => (b.captain_score || 0) - (a.captain_score || 0)
  );
  const recommendedC = sortedSquadByCaptain[0];
  const recommendedVc = sortedSquadByCaptain.length > 1 ? sortedSquadByCaptain[1] : undefined;

  const currentC = squadPlayers.find((p) => p.is_captain);

  const isCOptimal = Boolean(currentC && recommendedC && currentC.id === recommendedC.id);

  let cAdvice = '';
  if (isCOptimal && currentC) {
    cAdvice = `Your armband selection (${currentC.web_name}) is optimal! Highest Captain Score in your squad (${currentC.captain_score} pts).`;
  } else if (currentC && recommendedC) {
    cAdvice = `Consider giving (C) to ${recommendedC.web_name} (Captain Score ${recommendedC.captain_score}) over current choice ${currentC.web_name} (${currentC.captain_score}).`;
  } else {
    cAdvice = 'Set your armband to the highest form player with easy fixtures.';
  }

  const lineupSwaps: any[] = [];
  for (const bP of bench) {
    if (bP.position_name === 'GKP') continue;
    for (const sP of startingXi) {
      if (sP.position_name === bP.position_name) {
        const bXp = bP.expected_points || 0.0;
        const sXp = sP.expected_points || 0.0;
        if (bXp > sXp + 0.8) {
          lineupSwaps.push({
            bench_player: bP,
            starting_player: sP,
            gain_xp: parseFloat((bXp - sXp).toFixed(1)),
            reason: `Start ${bP.web_name} (${bXp} xP) over ${sP.web_name} (${sXp} xP) due to easier fixture & better form.`
          });
        }
      }
    }
  }

  const squadIds = new Set(squadPlayers.map((p) => p.id));
  let weakestPlayer: EnrichedSquadPlayer | undefined;
  if (squadPlayers.length > 0) {
    weakestPlayer = squadPlayers.reduce((prev, curr) =>
      (curr.transfer_score || 0) < (prev.transfer_score || 0) ? curr : prev
    );
  }

  let recommendedTransfer: any = undefined;
  if (weakestPlayer) {
    const weakPos = weakestPlayer.position_name;
    const weakPrice = weakestPlayer.price || 0.0;
    const maxBudget = parseFloat((weakPrice + bank).toFixed(1));

    const candidates = processedPlayers.filter(
      (p) => !squadIds.has(p.id) && p.position_name === weakPos && p.price <= maxBudget
    );
    candidates.sort((a, b) => (b.transfer_score || 0) - (a.transfer_score || 0));
    const topBuy = candidates[0];

    if (topBuy) {
      const gain = parseFloat(((topBuy.transfer_score || 0) - (weakestPlayer.transfer_score || 0)).toFixed(1));
      recommendedTransfer = {
        sell_player: weakestPlayer,
        buy_player: topBuy,
        max_budget: maxBudget,
        transfer_score_gain: gain,
        reason: `Sell ${weakestPlayer.web_name} (£${weakPrice}M, Rating ${weakestPlayer.transfer_score}) ➔ Buy ${topBuy.web_name} (£${topBuy.price}M, Rating ${topBuy.transfer_score}). Net +${gain} rating boost!`
      };
    }
  }

  return {
    manager_info: {
      id: managerProfile.id || 0,
      manager_name: managerName,
      team_name: teamName,
      overall_rank: overallRank,
      overall_points: overallPoints,
      bank,
      team_value: value,
      gameweek_fetched: picksData.gameweekFetched
    },
    starting_xi: startingXi,
    bench,
    ai_advice: {
      current_captain: currentC,
      recommended_captain: recommendedC,
      recommended_vice_captain: recommendedVc,
      is_captain_optimal: isCOptimal,
      captain_advice_text: cAdvice,
      lineup_swaps: lineupSwaps,
      transfer_recommendation: recommendedTransfer
    }
  };
}

export function getPlayerActionVerdict(player: Player): PlayerActionVerdict {
  const form = player.form_score || 0.0;
  const fdr = player.upcoming_fdr || 3.0;
  const transferScore = player.transfer_score || 0.0;
  const rotRisk = player.rotation_risk || 'Medium';

  let verdict: 'BUY' | 'HOLD' | 'AVOID' = 'AVOID';
  let color: 'green' | 'yellow' | 'red' = 'red';
  let headline = `Avoid / Sell 🔴 (${transferScore} Rating)`;

  if (transferScore >= 60.0 && fdr <= 3.2 && rotRisk !== 'High') {
    verdict = 'BUY';
    color = 'green';
    headline = `Strong Buy 🟢 (${transferScore} Rating)`;
  } else if (transferScore >= 42.0 && rotRisk !== 'High') {
    verdict = 'HOLD';
    color = 'yellow';
    headline = `Hold / Watch 🟡 (${transferScore} Rating)`;
  }

  const ict90 = player.ict_per_90 || 0.0;
  const threatStars = Math.min(Math.max(Math.round((ict90 / 2.5) * 5), 1), 5);

  const reasons: string[] = [];
  if (form >= 5.0) reasons.push(`🔥 Outstanding form (${form} pts/GW)`);
  else if (form <= 2.0) reasons.push(`⚠️ Poor recent form (${form} pts/GW)`);

  if (fdr <= 2.6) reasons.push(`🟢 Favorable 5-GW fixture run (Avg FDR ${fdr})`);
  else if (fdr >= 3.8) reasons.push(`🔴 Tough upcoming fixtures (Avg FDR ${fdr})`);

  if (rotRisk === 'Low') reasons.push('🟢 Excellent minutes security (Low rotation risk)');
  else if (rotRisk === 'High') reasons.push('🔴 High rotation risk');

  if (reasons.length === 0) reasons.push('Moderate overall statistical performance');

  return {
    verdict,
    color,
    headline,
    threat_stars: threatStars,
    minutes_security: rotRisk === 'Low' ? 'Excellent' : rotRisk === 'Medium' ? 'Moderate' : 'Low',
    fixture_quality: fdr <= 2.6 ? 'Excellent' : fdr <= 3.2 ? 'Good' : 'Tough',
    reasons
  };
}

export function generateOptimalSquad(
  processedPlayers: Player[],
  budget: number = 100.0,
  formation: string = '3-4-3',
  _lockedIds: number[] = [],
  excludedIds: number[] = []
): OptimalSquadResponse {
  const formationsMap: Record<string, [number, number, number]> = {
    '3-4-3': [3, 4, 3],
    '3-5-2': [3, 5, 2],
    '4-3-3': [4, 3, 3],
    '4-4-2': [4, 4, 2],
    '5-3-2': [5, 3, 2]
  };

  const [nDef, nMid, nFwd] = formationsMap[formation] || [3, 4, 3];
  const exclSet = new Set(excludedIds);
  const available = processedPlayers.filter((p) => !exclSet.has(p.id));

  const gkpPool = available.filter((p) => p.position_name === 'GKP').sort((a, b) => b.transfer_score - a.transfer_score);
  const defPool = available.filter((p) => p.position_name === 'DEF').sort((a, b) => b.transfer_score - a.transfer_score);
  const midPool = available.filter((p) => p.position_name === 'MID').sort((a, b) => b.transfer_score - a.transfer_score);
  const fwdPool = available.filter((p) => p.position_name === 'FWD').sort((a, b) => b.transfer_score - a.transfer_score);

  const startingGkp = gkpPool[0];
  const benchGkp = gkpPool.length > 1 ? gkpPool[1] : gkpPool[0];

  const startingDef = defPool.slice(0, nDef);
  const benchDef = defPool.slice(nDef, 5);

  const startingMid = midPool.slice(0, nMid);
  const benchMid = midPool.slice(nMid, 5);

  const startingFwd = fwdPool.slice(0, nFwd);
  const benchFwd = fwdPool.slice(nFwd, 3);

  const startingXi = [startingGkp, ...startingDef, ...startingMid, ...startingFwd].filter(Boolean);
  const bench = [benchGkp, ...benchDef, ...benchMid, ...benchFwd].filter(Boolean);

  const squad15 = [...startingXi, ...bench];
  const totalCost = parseFloat(squad15.reduce((sum, p) => sum + p.price, 0).toFixed(1));

  const sortedByCaptain = [...startingXi].sort((a, b) => b.captain_score - a.captain_score);
  const captain = sortedByCaptain[0];
  const viceCaptain = sortedByCaptain.length > 1 ? sortedByCaptain[1] : undefined;

  const differentials = squad15
    .filter((p) => p.selected_by_percent < 10.0)
    .sort((a, b) => b.transfer_score - a.transfer_score);
  const differentialPick = differentials[0];

  const totalXp5gw = parseFloat(
    (
      startingXi.reduce((sum, p) => sum + (p.expected_points || 0) * 5, 0) +
      ((captain?.expected_points || 0) * 5)
    ).toFixed(1)
  );

  const avgTransferScore = startingXi.length
    ? startingXi.reduce((sum, p) => sum + p.transfer_score, 0) / startingXi.length
    : 75.0;
  const teamScore = Math.min(Math.max(Math.round(avgTransferScore * 1.05), 50), 99);

  const selectionReasons: PlayerSelectionReason[] = startingXi.map((p) => {
    const reasons: string[] = [];
    if (p.form_score >= 5.0) reasons.push(`Outstanding form (${p.form_score} pts/GW)`);
    if (p.upcoming_fdr <= 2.6) reasons.push(`Easy upcoming fixture run (Avg FDR ${p.upcoming_fdr})`);
    if (p.value_score >= 8.0) reasons.push(`High points-per-million value (${p.value_score})`);
    if (p.set_piece_role && p.set_piece_role !== 'None') reasons.push(`Takes set-pieces (${p.set_piece_role})`);
    if (reasons.length === 0) reasons.push('Top composite rating in position');

    return {
      player: p,
      primary_reason: reasons[0],
      all_reasons: reasons
    };
  });

  return {
    formation,
    budget_used: totalCost,
    max_budget: budget,
    expected_points_5gw: totalXp5gw,
    team_score: teamScore,
    starting_xi: startingXi,
    bench,
    captain,
    vice_captain: viceCaptain,
    differential_pick: differentialPick,
    selection_reasons: selectionReasons
  };
}
