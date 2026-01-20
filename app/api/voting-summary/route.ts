import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;
export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('_proposal_id');

    if (!proposalId) {
        return NextResponse.json(
            { error: 'Proposal ID is required' },
            { status: 400 }
        );
    }

    try {
        const url = `https://api.koios.rest/api/v1/proposal_voting_summary?_proposal_id=${encodeURIComponent(proposalId)}`;

        const response = await fetch(url, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
            headers: {
                'accept': 'application/json',
                'authorization': process.env.KOIOS_API_KEY || ''
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Koios API error:', {
                status: response.status,
                statusText: response.statusText,
                errorText,
                proposalId
            });

            return NextResponse.json(
                {
                    error: 'Failed to fetch voting summary from Koios API',
                    details: `HTTP ${response.status}: ${response.statusText}`,
                    proposalId
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            data,
            proposalId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Voting summary API error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            proposalId
        });

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
                proposalId
            },
            { status: 500 }
        );
    }
}
