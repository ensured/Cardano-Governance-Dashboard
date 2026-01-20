import { VotingSummary } from "@/types/votingSummary";

export async function getVotingSummary(proposalId: string): Promise<VotingSummary[]> {
    console.log('Fetching voting summary for proposal ID:', proposalId);

    try {
        const url = `/api/voting-summary?_proposal_id=${encodeURIComponent(proposalId)}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
            headers: {
                'accept': 'application/json',
                'authorization': process.env.KOIOS_API_KEY || ''
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            let errorData: any = {};
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorData = JSON.parse(errorText);
                }
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
            }

            console.error('Error response:', errorData);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Response data:', result);

        return result.data || [];
    } catch (error) {
        console.error('Failed to fetch voting summary:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            proposalId
        });
        return [];
    }
}
