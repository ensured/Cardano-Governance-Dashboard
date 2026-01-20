"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VotingSummary, Metadata } from "@/types/votingSummary";
import { getVotingSummary } from "@/lib/getVotingSummary";
import { Loader2, ChevronDown, ChevronUp, FileText, Target, Lightbulb, Users, ExternalLink } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts';

function truncateHash(hash: string, length: number = 10) {
    return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}

function getActionBadgeClasses(proposalType: string): string {
    const type = proposalType.toLowerCase();

    if (type.includes('info') || type.includes('parameter') || type.includes('protocol')) {
        return "bg-blue-600 text-white border-blue-600"; // Blue for info actions
    } else if (type.includes('treasury') || type.includes('withdrawal')) {
        return "bg-gray-600 text-white border-gray-600"; // Gray for treasury actions
    } else if (type.includes('hard') || type.includes('no') || type.includes('reject')) {
        return "bg-red-600 text-white border-red-600"; // Red for hard forks or rejections
    } else {
        return "bg-zinc-700 text-zinc-100 border-zinc-600"; // Default zinc for other types
    }
}

export default function VotingSummaryDialog({ metadata, proposalId, proposalType }: { metadata: Metadata; proposalId: string; proposalType: string }) {
    const [votingData, setVotingData] = useState<VotingSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [openSections, setOpenSections] = useState({
        abstract: false,
        rationale: false,
        motivation: false,
        references: false
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };


    const fetchVotingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getVotingSummary(proposalId);
            if (data.length === 0) {
                setError('No voting data available for this proposal');
            }
            setVotingData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch voting data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && votingData.length === 0 && !error) {
            fetchVotingData();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="font-mono text-xs text-muted-foreground hover:text-foreground">
                    {truncateHash(proposalId)}
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-3xl max-w-7xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-col space-y-2">
                        <DialogTitle className="text-lg font-semibold break-words">
                            gov_action1{proposalId.slice(11, 22)}...{proposalId.slice(proposalId.length - 10, proposalId.length)}
                        </DialogTitle>
                        <div className="flex items-center gap-2 flex-wrap">

                            <Badge variant="default" className={`text-xs ${getActionBadgeClasses(proposalType)}`}>
                                {proposalType}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-8 flex items-center justify-center">
                            <Loader2 className="text-muted-foreground animate-spin" />
                        </div>
                    ) : votingData.length === 0 ? (
                        <div className="text-center py-8 flex items-center justify-center">
                            <p className="text-muted-foreground">No voting data available</p>
                        </div>
                    ) : (
                        votingData.map((summary, index) => (
                            <div key={index} className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Epoch {summary.epoch_no}
                                </div>

                                <div className="text-xs text-muted-foreground mt-2">
                                    {metadata.body.title}
                                </div>

                                {/* Proposal Details Collapsible Sections */}
                                <div className="space-y-3">
                                    {/* Abstract */}
                                    <Collapsible open={openSections.abstract} onOpenChange={() => toggleSection('abstract')}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="font-medium">Abstract</span>
                                                </div>
                                                {openSections.abstract ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-2 pb-2">
                                            <p className="text-sm text-muted-foreground leading-relaxed break-words max-w-full">
                                                {metadata.body.abstract}
                                            </p>
                                        </CollapsibleContent>
                                    </Collapsible>

                                    {/* Rationale */}
                                    <Collapsible open={openSections.rationale} onOpenChange={() => toggleSection('rationale')}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    <span className="font-medium">Rationale</span>
                                                </div>
                                                {openSections.rationale ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-2 pb-2">
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words max-w-full">
                                                {metadata.body.rationale}
                                            </p>
                                        </CollapsibleContent>
                                    </Collapsible>

                                    {/* Motivation */}
                                    <Collapsible open={openSections.motivation} onOpenChange={() => toggleSection('motivation')}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                                                <div className="flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4" />
                                                    <span className="font-medium">Motivation</span>
                                                </div>
                                                {openSections.motivation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-2 pb-2">
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words max-w-full">
                                                {metadata.body.motivation}
                                            </p>
                                        </CollapsibleContent>
                                    </Collapsible>

                                    {/* References */}
                                    {metadata.body.references && metadata.body.references.length > 0 && (
                                        <Collapsible open={openSections.references} onOpenChange={() => toggleSection('references')}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="font-medium">References ({metadata.body.references.length})</span>
                                                    </div>
                                                    {openSections.references ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="px-2 pb-2">
                                                <div className="space-y-2">
                                                    {metadata.body.references.map((ref, index) => (
                                                        <div key={index} className="flex items-start gap-2 text-sm">
                                                            <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0 text-muted-foreground" />
                                                            <a
                                                                href={ref.uri}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 hover:underline break-all max-w-[calc(100%-1rem)]"
                                                            >
                                                                {ref.label}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}

                                    {/* Authors */}
                                    {metadata.authors && metadata.authors.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 flex-wrap">
                                            <Users className="h-4 w-4 flex-shrink-0" />
                                            <span className="break-words">Authors: {metadata.authors.map(author => author.name).join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* DRep Voting */}
                                <div className="bg-card rounded-lg p-4">
                                    <h3 className="font-semibold text-foreground mb-3">DRep Voting</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Yes', value: summary.drep_yes_pct, fill: '#10b981' },
                                                        { name: 'No', value: summary.drep_no_pct, fill: '#ef4444' },
                                                        { name: 'Abstain', value: 100 - summary.drep_yes_pct - summary.drep_no_pct, fill: '#6b7280' }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {summary.drep_yes_votes_cast} yes votes, {summary.drep_no_votes_cast} no votes, {summary.drep_abstain_votes_cast} abstain
                                    </div>
                                </div>

                                {/* Pool Voting */}
                                {summary.pool_yes_votes_cast === 0 && summary.pool_no_votes_cast === 0 && summary.pool_abstain_votes_cast === 0 ? (
                                    <></>
                                ) : (
                                    <div className="bg-card rounded-lg p-4">
                                        <h3 className="font-semibold text-foreground mb-3">Stake Pool Voting</h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Yes', value: summary.pool_yes_pct, fill: '#10b981' },
                                                            { name: 'No', value: summary.pool_no_pct, fill: '#ef4444' },
                                                            { name: 'Abstain', value: 100 - summary.pool_yes_pct - summary.pool_no_pct, fill: '#6b7280' }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {summary.pool_yes_votes_cast} yes votes, {summary.pool_no_votes_cast} no votes, {summary.pool_abstain_votes_cast} abstain
                                        </div>
                                    </div>
                                )}

                                {/* Committee Voting */}
                                {summary.committee_yes_votes_cast === 0 && summary.committee_no_votes_cast === 0 && summary.committee_abstain_votes_cast === 0 ? (
                                    <></>
                                ) : (
                                    <div className="bg-card rounded-lg p-4">
                                        <h3 className="font-semibold text-foreground mb-3">Committee Voting</h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Yes', value: summary.committee_yes_pct, fill: '#10b981' },
                                                            { name: 'No', value: summary.committee_no_pct, fill: '#ef4444' },
                                                            { name: 'Abstain', value: 100 - summary.committee_yes_pct - summary.committee_no_pct, fill: '#6b7280' }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {summary.committee_yes_votes_cast} yes votes, {summary.committee_no_votes_cast} no votes, {summary.committee_abstain_votes_cast} abstain
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
