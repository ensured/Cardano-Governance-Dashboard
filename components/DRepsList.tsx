'use client';

import { useState } from 'react';

interface DRep {
    drep_id: string;
    hex: string;
    has_script: boolean;
    registered: boolean;
}

interface DRepsListProps {
    dReps: DRep[];
    error?: string | null;
}

export default function DRepsList({ dReps, error = null }: DRepsListProps) {
    const loading = dReps.length === 0 && !error;

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

    return (
        <>
            <div className='flex justify-center items-center text-black/70 font-sans text-xs'> Found {dReps.length} DReps</div>
            <div className="overflow-x-auto rounded-xl border border-zinc-800/30 max-h-[69vh] overflow-y-auto shadow-lg shadow-zinc-900/20 backdrop-blur-sm bg-zinc-900/20">
                <table className="min-w-[800px] divide-y divide-zinc-700/50">
                    <thead className="bg-gradient-to-r from-zinc-800/60 to-zinc-800/40 backdrop-blur-sm sticky top-0 z-10">
                        <tr className="hover:bg-zinc-700/30 transition-all duration-200">
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                DRep ID
                            </th>

                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Has Script
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-700/50">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700/30 bg-zinc-900/30">
                        {dReps.map((drep, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-zinc-900/20 hover:bg-zinc-800/40' : 'bg-zinc-800/10 hover:bg-zinc-700/30'} >
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200 border-b border-zinc-700/20">
                                    {drep.drep_id}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200 border-b border-zinc-700/20">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${drep.has_script ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                        {drep.has_script ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200 border-b border-zinc-700/20">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${drep.registered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                                        {drep.registered ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
