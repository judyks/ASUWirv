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
// Simplified IRV calculation logic
function calculateIRV(votes, position) {
    var _a;
    let rounds = [];
    let candidates = new Set(votes.flat()); // Assuming all candidates appear at least once
    let currentVotes = votes;
    while (candidates.size > 1) {
        let voteCounts = new Map();
        currentVotes.forEach(vote => {
            if (vote.length > 0) {
                voteCounts.set(vote[0], (voteCounts.get(vote[0]) || 0) + 1);
            }
        });
        let minVotes = Math.min(...voteCounts.values());
        let maxVotes = Math.max(...voteCounts.values());
        let totalVotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);
        rounds.push({ votes: new Map(voteCounts), eliminated: [] });
        if (maxVotes > totalVotes / 2) {
            let winner = (_a = Array.from(voteCounts.entries()).find(([_, v]) => v === maxVotes)) === null || _a === void 0 ? void 0 : _a[0];
            return {
                position: position,
                winner: winner || null,
                rounds,
                candidates: Array.from(candidates),
            };
        }
        let eliminatedCandidates = Array.from(voteCounts.entries()).filter(([_, v]) => v === minVotes).map(([k]) => k);
        rounds[rounds.length - 1].eliminated = eliminatedCandidates;
        candidates = new Set(Array.from(candidates).filter(c => !eliminatedCandidates.includes(c)));
        currentVotes = currentVotes.map(vote => vote.filter(candidate => !eliminatedCandidates.includes(candidate)));
    }
    // If loop exits without finding a winner, return all remaining candidates as tied
    return {
        position: position,
        winner: null,
        rounds,
        candidates: Array.from(candidates),
    };
}
exports.calculateIRV = calculateIRV;
