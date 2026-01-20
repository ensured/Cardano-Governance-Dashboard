export interface VotingSummary {
    proposal_type: string;
    epoch_no: number;
    drep_yes_votes_cast: number;
    drep_active_yes_vote_power: string;
    drep_yes_vote_power: string;
    drep_yes_pct: number;
    drep_no_votes_cast: number;
    drep_active_no_vote_power: string;
    drep_no_vote_power: string;
    drep_no_pct: number;
    drep_abstain_votes_cast: number;
    drep_active_abstain_vote_power: string;
    drep_always_no_confidence_vote_power: string;
    drep_always_abstain_vote_power: string;
    pool_yes_votes_cast: number;
    pool_active_yes_vote_power: string;
    pool_yes_vote_power: string;
    pool_yes_pct: number;
    pool_no_votes_cast: number;
    pool_active_no_vote_power: string;
    pool_no_vote_power: string;
    pool_no_pct: number;
    pool_abstain_votes_cast: number;
    pool_active_abstain_vote_power: string;
    pool_passive_always_abstain_votes_assigned: number;
    pool_passive_always_abstain_vote_power: string;
    pool_passive_always_no_confidence_votes_assigned: number;
    pool_passive_always_no_confidence_vote_power: string;
    committee_yes_votes_cast: number;
    committee_yes_pct: number;
    committee_no_votes_cast: number;
    committee_no_pct: number;
    committee_abstain_votes_cast: number;
}

export interface Metadata {
    body: {
        title: string;
        abstract: string;
        rationale: string;
        motivation: string;
        onChain: {
            governanceActionType: string;
            depositReturnAddress?: string;
        };
        references?: Array<{
            uri: string;
            label: string;
            "@type": string;
        }>;
    };
    authors?: Array<{
        name: string;
    }>;
}
