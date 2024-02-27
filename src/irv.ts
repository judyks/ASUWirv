export type Vote = string[];
export interface RoundResult {
    votes: { [candidate: string]: number }; // Changed from Map to Object for serialization
    eliminated: string[];
}
export interface IRVResult {
    position: string;
    winner: string | null;
    rounds: RoundResult[];
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

function calculateRound(votes: Vote[]): { winner: string | null, roundResult: RoundResult } {
    let tally = votes.reduce((acc, vote) => {
        if (vote.length > 0) {
            const firstChoice = vote[0];
            acc[firstChoice] = (acc[firstChoice] || 0) + 1;
        }
        return acc;
    }, {} as { [candidate: string]: number });

    const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
    const majority = totalVotes / 2;
    const candidates = Object.keys(tally);
    let winner: string | null = null;

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

export function calculateIRV(votes: Vote[], position: PositionName): IRVResult {
    const rounds: RoundResult[] = [];
    let currentVotes = [...votes];
    let winner: string | null = null;

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
