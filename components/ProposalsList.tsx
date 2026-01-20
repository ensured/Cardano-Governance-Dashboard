'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { X, ArrowRightCircleIcon, ArrowUp } from "lucide-react"

interface VotingSummary {
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

interface Proposal {
    block_time: number;
    proposal_id: string;
    proposal_tx_hash: string;
    proposal_index: number;
    proposal_type: string;
    proposal_description: string;
    deposit: number;
    return_address: string;
    proposed_epoch: number;
    ratified_epoch: number | null;
    enacted_epoch: number | null;
    dropped_epoch: number | null;
    expired_epoch: number | null;
    expiration: number;
    meta_url: string | null;
    meta_hash: string | null;
    meta_json: any;
    meta_comment: string | null;
    meta_language: string | null;
    meta_is_valid: boolean | null;
    withdrawal: number | null;
    param_proposal: any | null;
}

export default function ProposalsList() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [votingSummary, setVotingSummary] = useState<VotingSummary | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingVotes, setIsLoadingVotes] = useState(false);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await fetch('https://api.koios.rest/api/v1/proposal_list', {
                    headers: {
                        'accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProposals(data);
            } catch (err) {
                console.error('Error fetching proposals:', err);
                setError('Failed to load proposals. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const fetchVotingSummary = async (proposalId: string) => {
        if (!proposalId) return;

        setIsLoadingVotes(true);
        try {
            const response = await fetch(
                `https://api.koios.rest/api/v1/proposal_voting_summary?_proposal_id=${proposalId}`,
                { headers: { 'accept': 'application/json' } }
            );

            if (!response.ok) throw new Error('Failed to fetch voting summary');

            const data = await response.json();
            if (data && data.length > 0) {
                setVotingSummary(data[0]);
            }
        } catch (err) {
            console.error('Error fetching voting summary:', err);
            setError('Failed to load voting data. Please try again.');
        } finally {
            setIsLoadingVotes(false);
        }
    };

    const handleProposalClick = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        fetchVotingSummary(proposal.proposal_id);
        setIsModalOpen(true);
    };

    const getProposalType = (type: string) => {
        const types: { [key: string]: string } = {
            'ParameterChange': 'Parameter Change',
            'HardForkInitiation': 'Hard Fork',
            'TreasuryWithdrawals': 'Treasury',
            'NoConfidence': 'No Confidence',
            'NewCommittee': 'Committee',
            'NewConstitution': 'Constitution',
            'InfoAction': 'Info'
        };
        return types[type] || type;
    };

    const formatVotePower = (power: string) => {
        if (!power) return '0';
        const num = parseFloat(power);
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const getVoteBarColor = (type: string) => {
        switch (type) {
            case 'yes': return 'bg-green-500';
            case 'no': return 'bg-red-500';
            case 'abstain': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-zinc-200">Governance Proposals</h3>

            {/* Voting Summary Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">

                            <DialogTrigger className="relative transform overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/50 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md text-zinc-400 hover:text-zinc-500"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <DialogTitle className="text-lg font-semibold leading-6 text-zinc-100">
                                            {selectedProposal && `Proposal: ${selectedProposal.proposal_id}`}
                                        </DialogTitle>

                                        {isLoadingVotes ? (
                                            <div className="mt-4 flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : votingSummary ? (
                                            <div className="mt-4 space-y-6">
                                                {/* DRep Votes */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-zinc-300 mb-2">DRep Votes</h4>
                                                    <div className="space-y-3">
                                                        {['yes', 'no', 'abstain'].map((type) => {
                                                            const votes = type === 'yes' ? votingSummary.drep_yes_votes_cast :
                                                                type === 'no' ? votingSummary.drep_no_votes_cast :
                                                                    votingSummary.drep_abstain_votes_cast;
                                                            const power = type === 'yes' ? votingSummary.drep_yes_vote_power :
                                                                type === 'no' ? votingSummary.drep_no_vote_power :
                                                                    votingSummary.drep_always_abstain_vote_power;
                                                            const pct = type === 'yes' ? votingSummary.drep_yes_pct :
                                                                type === 'no' ? votingSummary.drep_no_pct : 0;

                                                            return (
                                                                <div key={`drep-${type}`} className="space-y-1">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-zinc-400 capitalize">{type} ({votes})</span>
                                                                        <span className="text-zinc-300">{formatVotePower(power)} ₳ ({pct?.toFixed(1)}%)</span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${getVoteBarColor(type as any)}`}
                                                                            style={{ width: `${pct}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Pool Votes */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Pool Votes</h4>
                                                    <div className="space-y-3">
                                                        {['yes', 'no', 'abstain'].map((type) => {
                                                            const votes = type === 'yes' ? votingSummary.pool_yes_votes_cast :
                                                                type === 'no' ? votingSummary.pool_no_votes_cast :
                                                                    votingSummary.pool_abstain_votes_cast;
                                                            const power = type === 'yes' ? votingSummary.pool_yes_vote_power :
                                                                type === 'no' ? votingSummary.pool_no_vote_power :
                                                                    votingSummary.pool_passive_always_abstain_vote_power;
                                                            const pct = type === 'yes' ? votingSummary.pool_yes_pct :
                                                                type === 'no' ? votingSummary.pool_no_pct : 0;

                                                            return (
                                                                <div key={`pool-${type}`} className="space-y-1">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-zinc-400 capitalize">{type} ({votes})</span>
                                                                        <span className="text-zinc-300">{formatVotePower(power)} ₳ ({pct?.toFixed(1)}%)</span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${getVoteBarColor(type as any)}`}
                                                                            style={{ width: `${pct}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Committee Votes */}
                                                {(votingSummary.committee_yes_votes_cast > 0 || votingSummary.committee_no_votes_cast > 0) && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Committee Votes</h4>
                                                        <div className="space-y-3">
                                                            {['yes', 'no'].map((type) => {
                                                                const votes = type === 'yes' ? votingSummary.committee_yes_votes_cast :
                                                                    votingSummary.committee_no_votes_cast;
                                                                const pct = type === 'yes' ? votingSummary.committee_yes_pct :
                                                                    votingSummary.committee_no_pct;

                                                                return (
                                                                    <div key={`committee-${type}`} className="space-y-1">
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-zinc-400 capitalize">{type} ({votes})</span>
                                                                            <span className="text-zinc-300">{pct?.toFixed(1)}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-zinc-800 rounded-full h-2">
                                                                            <div
                                                                                className={`h-2 rounded-full ${getVoteBarColor(type as any)}`}
                                                                                style={{ width: `${pct}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-zinc-400">No voting data available for this proposal.</p>
                                        )}
                                    </div>

                                    <div className="mt-5 sm:mt-6">
                                        <a
                                            href={`https://cexplorer.io/govactions/${selectedProposal?.proposal_tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-200 shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        >
                                            View on CExplorer <ArrowUp className="ml-2 h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </DialogTrigger>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


            <div className="overflow-x-auto rounded-xl border border-zinc-800/30 shadow-lg shadow-zinc-900/20 backdrop-blur-sm bg-zinc-900/20">
                <table className="min-w-[900px] divide-y divide-zinc-700/50">
                    <thead className="bg-gradient-to-r from-zinc-800/60 to-zinc-800/40 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Proposed
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Expires
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700/30 bg-zinc-900/30">
                        {proposals.map((proposal, index) => (
                            <tr
                                key={proposal.proposal_id}
                                className="hover:bg-zinc-800/30 transition-colors duration-150 cursor-pointer"
                                onClick={() => handleProposalClick(proposal)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-200 border-b border-zinc-700/20">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-zinc-400">#{index + 1}</span>
                                        <span className="truncate max-w-xs">{proposal.proposal_id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300 border-b border-zinc-700/20">
                                    {getProposalType(proposal.proposal_type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-b border-zinc-700/20">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${proposal.enacted_epoch
                                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                        : proposal.expired_epoch || proposal.dropped_epoch
                                            ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                                            : proposal.ratified_epoch
                                                ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                                        }`}>
                                        {proposal.enacted_epoch
                                            ? 'Enacted'
                                            : proposal.expired_epoch
                                                ? 'Expired'
                                                : proposal.dropped_epoch
                                                    ? 'Dropped'
                                                    : proposal.ratified_epoch
                                                        ? 'Ratified'
                                                        : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 border-b border-zinc-700/20">
                                    Epoch {proposal.proposed_epoch}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 border-b border-zinc-700/20">
                                    Epoch {proposal.expiration}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-sm text-zinc-500 text-center">
                Showing {proposals.length} proposals
            </div>
        </div >
    );
}
