'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SearchSession from './SearchSessions';
import { PlusIcon } from '@/icons/icons';
import { Spinner } from '@nextui-org/react';
import useAvtarSession from '@/hooks/useAvtarSession';

// Function to format the interview summary into sections
const formatInterviewSummary = (summary: string) => {
    if (!summary) return null;

    // Split the summary by the main section headers
    const sections = summary.split(/\*\*(STRENGTHS|AREAS FOR IMPROVEMENT|RECOMMENDATIONS|OVERALL PERFORMANCE):\*\*/);
    
    const formattedSections = [];
    
    for (let i = 1; i < sections.length; i += 2) {
        const sectionTitle = sections[i];
        const sectionContent = sections[i + 1]?.trim();
        
        if (sectionContent) {
            // Split content into sentences and create bullet points
            const sentences = sectionContent
                .split(/\.\s+/)
                .filter(sentence => sentence.trim().length > 0)
                .map(sentence => sentence.trim() + (sentence.endsWith('.') ? '' : '.'));

            formattedSections.push({
                title: sectionTitle,
                points: sentences
            });
        }
    }

    return formattedSections;
};

// Component to render formatted summary
const FormattedSummary = ({ summary, isExpanded }: { summary: string; isExpanded: boolean }) => {
    const formattedSections = formatInterviewSummary(summary);
    
    if (!formattedSections || formattedSections.length === 0) {
        return <span className="text-gray-600">{summary}</span>;
    }

    const getSectionColor = (title: string) => {
        switch (title) {
            case 'STRENGTHS':
                return 'text-green-600 border-green-200 bg-green-50';
            case 'AREAS FOR IMPROVEMENT':
                return 'text-orange-600 border-orange-200 bg-orange-50';
            case 'RECOMMENDATIONS':
                return 'text-blue-600 border-blue-200 bg-blue-50';
            case 'OVERALL PERFORMANCE':
                return 'text-purple-600 border-purple-200 bg-purple-50';
            default:
                return 'text-gray-600 border-gray-200 bg-gray-50';
        }
    };

    const getSectionIcon = (title: string) => {
        switch (title) {
            case 'STRENGTHS':
                return '✅';
            case 'AREAS FOR IMPROVEMENT':
                return '🔄';
            case 'RECOMMENDATIONS':
                return '💡';
            case 'OVERALL PERFORMANCE':
                return '📊';
            default:
                return '📝';
        }
    };

    if (!isExpanded) {
        // Show only first section with first 2 points when collapsed
        const firstSection = formattedSections[0];
        const limitedPoints = firstSection.points.slice(0, 2);
        
        return (
            <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSectionColor(firstSection.title)}`}>
                    <span>{getSectionIcon(firstSection.title)}</span>
                    <span>{firstSection.title}</span>
                </div>
                <div className="space-y-1">
                    {limitedPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{point}</span>
                        </div>
                    ))}
                    {firstSection.points.length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                            +{firstSection.points.length - 2} more points, {formattedSections.length - 1} more sections...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {formattedSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSectionColor(section.title)}`}>
                        <span>{getSectionIcon(section.title)}</span>
                        <span>{section.title}</span>
                    </div>
                    <div className="space-y-1 pl-2">
                        {section.points.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export type SessionData = {
    id: string;
    summary: string | null;
    createdAt: string;
    chats: {
        id: string;
        message: string;
        sender: "AI" | "USER";
        createdAt: string;
    }[];
};

interface UserSessionsTableProps {
    onStartSession: () => void;
    startLoading: boolean;
}

const UserSessionsTable = ({ onStartSession, startLoading }: UserSessionsTableProps) => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());

    // Fetch user sessions from the backend
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get("/api/sessions");
                if (response.status === 200) {
                    setSessions(response.data.data || []);
                } else {
                    console.error(response.data.error);
                }
            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleGenerateSummary = async (sessionId: string) => {
        setSummarizingIds(prev => new Set(prev).add(sessionId));
        
        try {
            console.log('🔄 Starting summary generation for session:', sessionId);
            
            // First, let's check if the session has any chats
            const sessionCheck = await axios.get(`/api/sessions`);
            const currentSession = sessionCheck.data.data.find((s: any) => s.id === sessionId);
            console.log('📊 Session data:', currentSession);
            console.log('💬 Number of chats:', currentSession?.chats?.length || 0);
            
            if (!currentSession?.chats?.length) {
                console.warn('⚠️ No chats found for this session');
                alert('No chats found for this session. Make sure you completed an interview first.');
                return;
            }
            
            const response = await axios.post('/api/summarize', { sessionId });
            console.log('✅ Summary API response:', response.data);
            
            if (response.status === 200) {
                // Update the session with the new summary
                setSessions(prev => prev.map(session => 
                    session.id === sessionId 
                        ? { ...session, summary: response.data.summary }
                        : session
                ));
                console.log('✅ Summary generated successfully');
            }
        } catch (error: any) {
            console.error('❌ Error generating summary:', error);
            console.error('📋 Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 404) {
                alert('Session or chats not found. Please complete an interview first.');
            } else {
                alert(`Error generating summary: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setSummarizingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(sessionId);
                return newSet;
            });
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const truncateText = (text: string, limit: number) => {
        return text.length > limit ? `${text.substring(0, limit)}...` : text;
    };

    // Skeleton Placeholder Rows (No external library)


    return (
        <div className="w-full md:mt-10 p-4">
            <div className='md:flex  justify-between items-center '>
                <h1 className=" scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
                    Your Interview History
                    <div className='text-sm text-gray-500 dark:text-[#ffffff64]'>Manage sessions and track your progress</div>
                </h1>
                <div className='flex justify-center items-center gap-3'>
                    <SearchSession onSearch={() => { }} />
                    
                    {/* Debug Test Button - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <Button 
                            onClick={async () => {
                                try {
                                    console.log('🧪 Testing summarization with existing session...');
                                    console.log('📋 Available sessions:', sessions.map(s => ({id: s.id, chats: s.chats?.length || 0, summary: !!s.summary})));
                                    
                                    // Use an existing session if available
                                    if (sessions.length === 0) {
                                        alert('Please create a session first by starting an interview!');
                                        return;
                                    }
                                    
                                    const existingSession = sessions.find(s => s.chats && s.chats.length > 0);
                                    if (!existingSession) {
                                        alert('No sessions with chats found. Please complete an interview first!');
                                        return;
                                    }
                                    
                                    const testSessionId = existingSession.id;
                                    console.log('📝 Using existing session:', testSessionId);
                                    console.log('💬 Session has chats:', existingSession.chats.length);
                                    console.log('📋 Chat preview:', existingSession.chats.slice(0, 3).map(c => `${c.sender}: ${c.message.substring(0, 50)}...`));
                                    
                                    // Try to summarize
                                    const summaryResponse = await axios.post('/api/summarize', { sessionId: testSessionId });
                                    console.log('✅ Test summary:', summaryResponse.data.summary);
                                    
                                    alert(`Test completed! Summary: ${summaryResponse.data.summary.substring(0, 100)}...`);
                                    
                                    // Refresh sessions list
                                    window.location.reload();
                                    
                                } catch (error: any) {
                                    console.error('❌ Test failed:', error);
                                    alert(`Test failed: ${error.response?.data?.message || error.message}`);
                                }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            🧪 Test
                        </Button>
                    )}
                    
                    {/* Empty state button when no sessions */}
                    {sessions.length === 0 && !loading && (
                        <Button 
                            onClick={onStartSession} 
                            disabled={startLoading}
                            className="group relative overflow-hidden bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] hover:from-[#4A7AFF] hover:to-[#3B6FFF] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-[#578CFF]/25 transition-all duration-300"
                        >
                            {startLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Starting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Start Your First Interview</span>
                                </div>
                            )}
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Button>
                    )}
                    
                    {/* Regular button when sessions exist */}
                    {sessions.length > 0 && (
                        <Button 
                            onClick={onStartSession} 
                            disabled={startLoading}
                            className="group relative overflow-hidden bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] hover:from-[#4A7AFF] hover:to-[#3B6FFF] text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-[#578CFF]/25 transition-all duration-300"
                        >
                            {startLoading ? (
                            <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span className="hidden md:inline">Starting...</span>
                            </div>
                        ) : (
                                <div className="flex items-center gap-2">
                                    <PlusIcon className="w-4 h-4" />
                                    <span className="hidden md:inline">New Interview</span>
                                    <span className="md:hidden">New</span>
                                </div>
                            )}
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                    )}
                </div>
            </div>
            <div className="rounded-xl border dark:border-[#3B4254] border-[#E9ECF1] shadow-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-[#212A39] rounded-t-xl">
                            {/* <TableHead className="border-b dark:border-[#3B4254] px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 ">
                                Session ID
                            </TableHead> */}
                            <TableHead className="border-b dark:border-[#3B4254] px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Summary
                            </TableHead>
                            <TableHead className="border-b dark:border-[#3B4254] px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Created At
                            </TableHead>
                            <TableHead className="border-b dark:border-[#3B4254] px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            renderSkeletonRows() // Display skeleton loading
                        ) : sessions.length > 0 ? (
                            sessions.map((session) => (
                                <TableRow key={session.id} className="hover:bg-gray-100 dark:hover:bg-[#2C3545] border-b dark:border-[#3B4254]">
                                    {/* <TableCell className="px-4 py-3">{session.id}</TableCell> */}
                                    <TableCell className="px-4 py-3">
                                        {session.summary ? (
                                            <div className="space-y-3">
                                                <FormattedSummary 
                                                    summary={session.summary} 
                                                    isExpanded={expandedRows.has(session.id)} 
                                                />
                                                <button
                                                    onClick={() => toggleExpand(session.id)}
                                                    className="text-[#578CFF] hover:text-[#4A7AFF] hover:underline text-sm font-medium transition-colors duration-200"
                                                >
                                                    {expandedRows.has(session.id) ? 'Show Less' : 'Show Full Summary'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <span>📝</span>
                                                <span className="italic">No summary available</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}{" "}
                                        {new Date(session.createdAt).toLocaleTimeString(undefined, {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        {!session.summary ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleGenerateSummary(session.id)}
                                                disabled={summarizingIds.has(session.id)}
                                                className="text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                                            >
                                                {summarizingIds.has(session.id) ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-purple-600 border-purple-200"></div>
                                                        <span>Generating...</span>
                                                    </div>
                                                ) : (
                                                    'Generate Summary'
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span>Summarized</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <PlusIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                No interviews yet
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                                                Start your first AI mock interview to practice and improve your skills.
                                            </p>
                                            <Button 
                                                onClick={onStartSession}
                                                disabled={startLoading}
                                                className="bg-gradient-to-r from-[#578CFF] to-[#4A7AFF] hover:from-[#4A7AFF] hover:to-[#3B6FFF] text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                {startLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                        <span>Starting...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <PlusIcon className="w-4 h-4" />
                                                        <span>Start Interview</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserSessionsTable;

export const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="animate-pulse">
            {/* <TableCell className="px-4 py-3 border-b dark:border-[#3B4254]">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded "></div>
            </TableCell> */}
            <TableCell className="px-4 py-3 border-b dark:border-[#3B4254]">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </TableCell>
            <TableCell className="px-4 py-3 border-b dark:border-[#3B4254]">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </TableCell>
            <TableCell className="px-4 py-3 text-center border-b dark:border-[#3B4254]">
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </TableCell>
        </TableRow>
    ));
};