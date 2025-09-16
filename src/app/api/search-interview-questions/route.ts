import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { genAI } from '@/lib/GeminiClient';

const pc = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

const interviewIndex = pc.index('ai-interviewe');
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('Getting embeddings for query:', query);
    const embeddingResult = await model.embedContent(query);
    const embeddingVector = embeddingResult.embedding.values;
    console.log('Got embeddings, vector length:', embeddingVector.length);

    console.log('Searching Pinecone...');
    const searchResults = await interviewIndex.query({
      vector: embeddingVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log('Pinecone search results:', searchResults);

    if (!searchResults.matches || searchResults.matches.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No relevant interview questions found',
        contexts: [],
        totalResults: 0,
      });
    }

    const contexts = searchResults.matches.map((match) => {
      const metadata = match.metadata as any;
      return `
Interview Question Details:
- Role: ${metadata.Role || 'Unknown'}
- Question: ${metadata.Question || 'Unknown'}
- Answer: ${metadata.Answer || 'Not specified'}
- Difficulty: ${metadata.Difficulty || 'Not specified'}
- Company: ${metadata.Company || 'Not specified'}
Relevance Score: ${match.score ? Math.round(match.score * 100) / 100 : 'Not available'}
`;
    });

    return NextResponse.json({
      success: true,
      contexts,
      totalResults: searchResults.matches.length,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        contexts: [],
        totalResults: 0,
      },
      { status: 500 }
    );
  }
} 