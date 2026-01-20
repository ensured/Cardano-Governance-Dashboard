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
            <div className="overflow-x-auto rounded-lg border border-zinc-800/30 max-h-[69vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-zinc-700">
                    <thead className="bg-zinc-800/50">
                        <tr className="hover:bg-zinc-800/30 transition-colors duration-150">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                DRep ID
                            </th>

                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Has Script
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-zinc-900/50 divide-y divide-zinc-800">
                        {dReps.map((drep, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-900/10'} >
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200">
                                    {drep.drep_id}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${drep.has_script ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {drep.has_script ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-200">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${drep.registered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
