"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateIRV = exports.PositionName = void 0;
var PositionName;
(function (PositionName) {
    PositionName["President"] = "President";
    PositionName["VicePresident"] = "Vice President";
    PositionName["UniversityAffairs"] = "Director of University Affairs";
    PositionName["InternalPolicy"] = "Director of Internal Policy";
    PositionName["CommunityRelations"] = "Director of Community Relations";
    PositionName["DiversityEfforts"] = "Director of Diversity Efforts";
    PositionName["Programming"] = "Director of Campus Partnerships";
})(PositionName || (exports.PositionName = PositionName = {}));
function calculateRound(votes) {
    let tally = votes.reduce((acc, vote) => {
        if (vote.length > 0) {
            const firstChoice = vote[0];
            acc[firstChoice] = (acc[firstChoice] || 0) + 1;
        }
        return acc;
    }, {});
    const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
    const majority = totalVotes / 2;
    const candidates = Object.keys(tally);
    let winner = null;
    candidates.forEach(candidate => {
        if (tally[candidate] > majority) {
            winner = candidate;
        }
    });
    if (winner) {
        return { winner, roundResult: { votes: tally, eliminated: [] } };
    }
    const votesPerCandidate = Object.entries(tally);
    const leastVotes = Math.min(...votesPerCandidate.map(([_, votes]) => votes));
    const eliminated = votesPerCandidate.filter(([_, votes]) => votes === leastVotes).map(([candidate]) => candidate);
    return { winner: null, roundResult: { votes: tally, eliminated } };
}
function calculateIRV(votes, position) {
    const rounds = [];
    let currentVotes = [...votes];
    let winner = null;
    while (!winner && currentVotes.some(vote => vote.length > 0)) {
        const { winner: roundWinner, roundResult } = calculateRound(currentVotes);
        winner = roundWinner;
        rounds.push(roundResult);
        if (!winner) {
            currentVotes = currentVotes.map(vote => vote.filter(choice => !roundResult.eliminated.includes(choice)));
        }
    }
    return {
        position: position,
        winner,
        rounds,
    };
}
exports.calculateIRV = calculateIRV;
