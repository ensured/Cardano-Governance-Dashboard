import { NextRequest, NextResponse } from 'next/server';

// Cache to store voting summary data
const votingCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('_proposal_id');

    if (!proposalId) {
        return NextResponse.json(
            { error: 'Proposal ID is required' },
            { status: 400 }
        );
    }

    // Check cache first (5 minute TTL)
    const cached = votingCache.get(proposalId);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log('Cache hit for proposal:', proposalId);
        return NextResponse.json({
            data: cached.data,
            proposalId,
            cached: true,
            timestamp: new Date().toISOString()
        });
    }

    try {
        console.log('Fetching from Koios API for proposal:', proposalId);
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

        // Cache the result for 5 minutes
        votingCache.set(proposalId, {
            data,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000 // 5 minutes
        });

        // Clean up old cache entries periodically
        if (votingCache.size > 100) {
            const now = Date.now();
            for (const [key, value] of votingCache.entries()) {
                if (now - value.timestamp > value.ttl) {
                    votingCache.delete(key);
                }
            }
        }

        return NextResponse.json({
            data,
            proposalId,
            cached: false,
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
