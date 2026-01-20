import Link from "next/link";
import VotingSummaryDialog from "@/components/VotingSummaryDialog";

interface Proposal {
  block_time: number;
  proposal_id: string;
  proposal_tx_hash: string;
  proposal_index: number;
  proposal_type: string;
  proposal_description: string;
  deposit: string;
  return_address: string;
  proposed_epoch: number;
  ratified_epoch: number;
  enacted_epoch: number;
  dropped_epoch: number;
  expired_epoch: number;
  expiration: number;
  meta_url: string;
  meta_hash: string;
  meta_json: any;
  meta_comment: string;
  meta_language: string;
  meta_is_valid: boolean;
  withdrawal?: {
    stake_address: string;
    amount: string;
  };
  param_proposal?: any;
}

async function getProposals(): Promise<Proposal[]> {
  try {
    const headers: HeadersInit = {
      'accept': 'application/json',
    };

    // Only add authorization header if API key is available
    if (process.env.KOIOS_API_KEY) {
      headers['authorization'] = process.env.KOIOS_API_KEY;
    }

    const response = await fetch('https://api.koios.rest/api/v1/proposal_list', {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    return [];
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString();
}

function formatAda(amount: string) {
  const lovelace = parseInt(amount);
  return (lovelace / 1000000).toLocaleString();
}

function truncateHash(hash: string, length: number = 10) {
  return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}

function formatAddress(address: string) {
  return `${address.substring(0, 11)}...${address.substring(address.length - 11)}`;
}

function getStatusPriority(proposal: Proposal): number {
  if (proposal.enacted_epoch > 0) return 3; // Enacted
  if (proposal.ratified_epoch > 0) return 2; // Ratified
  if (proposal.dropped_epoch > 0) return 5; // Dropped
  if (proposal.expired_epoch > 0) return 4; // Expired
  return 1; // Pending (highest priority)
}

function sortProposals(proposals: Proposal[]): Proposal[] {
  return [...proposals].sort((a, b) => {
    // First sort by status priority
    const priorityA = getStatusPriority(a);
    const priorityB = getStatusPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Then sort by proposed epoch (descending - most recent first)
    return b.proposed_epoch - a.proposed_epoch;
  });
}

export default async function ProposalsPage() {
  const proposals = await getProposals();
  const sortedProposals = sortProposals(proposals);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <main className="flex-grow pt-16 px-5">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Governance Proposals</h1>
            <p className="text-zinc-400">
              List of all Cardano governance proposals from the Koios API
            </p>
          </div>

          {sortedProposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">No proposals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[69vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 sticky left-0 z-50 bg-background">Proposal ID</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Proposed Epoch</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Deposit</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Return Address</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-300 z-40">Block Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProposals.map((proposal, index) => (
                    <tr key={`${proposal.proposal_id}-${proposal.proposal_tx_hash}-${index}`} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors w-full overflow-x-scroll">
                      <td className="py-3 px-4 sticky left-0 bg-background">
                        <VotingSummaryDialog
                          metadata={proposal.meta_json}
                          proposalId={proposal.proposal_id}
                          proposalType={proposal.proposal_type}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                          {proposal.proposal_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {proposal.proposed_epoch}
                      </td>
                      <td className="py-3 px-4">
                        {proposal.enacted_epoch > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800/50">
                            Enacted
                          </span>
                        ) : proposal.ratified_epoch > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-800/50">
                            Ratified
                          </span>
                        ) : proposal.dropped_epoch > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-800/50">
                            Dropped
                          </span>
                        ) : proposal.expired_epoch > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/30 text-gray-300 border border-gray-800/50">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900/30 text-zinc-300 border border-zinc-800/50">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {proposal.deposit ? `${formatAda(proposal.deposit)} ADA` : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`https://pool.pm/${proposal.return_address}`} target="_blank">
                          <div className="font-mono text-xs text-zinc-300" title={proposal.return_address}>
                            {formatAddress(proposal.return_address)}
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {proposal.block_time ? formatDate(proposal.block_time) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 text-xs text-zinc-500">
            <p>Data sourced from Koios REST API: https://api.koios.rest/api/v1/proposal_list</p>
          </div>
        </div>
      </main>
    </div>
  );
}