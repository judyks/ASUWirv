export type Vote = string[];
export interface RoundResult {
    votes: Map<string, number>;
    eliminated: string[];
}
export interface IRVResult {
    position: string;
    winner: string | null;
    rounds: RoundResult[];
    candidates: string[];
}

export enum PositionName {
    President = "President",
    VicePresident = "Vice President",
    UniversityAffairs = "Director of University Affairs",
    InternalPolicy = "Director of Internal Policy",
    CommunityRelations = "Director of Community Relations",
    DiversityEfforts = "Director of Diversity Efforts",
    Programming = "Director of Campus Partnerships",
}

// Simplified IRV calculation logic
export function calculateIRV(votes: Vote[], position: PositionName): IRVResult {
    let rounds: RoundResult[] = [];
    let candidates = new Set(votes.flat()); // Assuming all candidates appear at least once
    let currentVotes = votes;

    while (candidates.size > 1) {
        let voteCounts: Map<string, number> = new Map();
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
            let winner = Array.from(voteCounts.entries()).find(([_, v]) => v === maxVotes)?.[0];
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
