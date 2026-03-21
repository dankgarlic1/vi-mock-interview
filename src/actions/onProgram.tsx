'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/prisma';

import { Pinecone } from '@pinecone-database/pinecone';
import * as XLSX from 'xlsx';

import path from 'path';
import * as fs from 'fs';
import { genAI } from '@/lib/GeminiClient';

// Updated interview resource schema
const interviewResourceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().optional(),
  difficulty: z.string().optional(),
  company: z.string().optional(),
});

// Initialize Gemini and Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || ' ',
});
const interviewIndex = pinecone.Index('ai-interviewe');

// Function to map Excel row to interview resource object
function mapExcelRowToInterviewResource(row: any) {
  return {
    role: row['Role'] || '',
    question: row['Question'] || '',
    answer: row['Answer'] || '',
    difficulty: row['Difficulty'] || '',
    company: row['Company'] || '',
  };
}

function diagnoseFileAccess(filePath: string) {
  try {
    // Check file existence
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return false;
    }

    // Check file stats
    const stats = fs.statSync(filePath);

    console.log('File stats:', {
      isFile: stats.isFile(),
      size: stats.size,
      permissions: stats.mode.toString(8), // Octal representation of permissions
    });

    // Attempt to read
    fs.accessSync(filePath, fs.constants.R_OK);

    return true;
  } catch (error) {
    console.error(`File access error for ${filePath}:`, error);
    return false;
  }
}

// Bulk import function for interview resources
export async function bulkImportInterviewResources(filePath: string) {
  noStore();

  try {
    // Read the Excel file
    const fileBuffer = fs.readFileSync(filePath);

    // Read workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert worksheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Loaded ${data.length} interview questions from ${filePath}`);

    // Track successful and failed imports
    const importResults = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each row
    for (const [index, row] of data.entries()) {
      try {
        // Convert row to interview resource object
        const interviewData = mapExcelRowToInterviewResource(row);

        // Validate the data
        try {
          const validatedData = interviewResourceSchema.parse(interviewData);

          // Create the interview resource in Prisma
          const interviewResource = await prisma.interviewResource.create({
            data: {
              role: validatedData.role,
              question: validatedData.question,
              answer: validatedData.answer || '',
              difficulty: validatedData.difficulty || '',
              company: validatedData.company || '',
            },
          });

          // Generate embedding
          const textToEmbed = `
                Role: ${validatedData.role}
                Interview Question: ${validatedData.question}
                Answer: ${validatedData.answer || ''}
                Difficulty: ${validatedData.difficulty || ''}
                Company: ${validatedData.company || ''}
`;

          const embeddingResult = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: textToEmbed,
            config: {
              taskType: 'RETRIEVAL_DOCUMENT',
              outputDimensionality: 768,
            },
          });

          if (
            !embeddingResult.embeddings ||
            embeddingResult.embeddings.length === 0
          ) {
            throw new Error('Failed to generate embeddings');
          }

          const embeddingVector = embeddingResult.embeddings[0].values;

          if (!embeddingVector) {
            throw new Error('Embedding vector is undefined');
          }

          const vectors = [];

          vectors.push({
            id: `interview-${interviewResource.id}`,
            values: embeddingVector,
            metadata: {
              Role: validatedData.role,
              Question: validatedData.question,
              Answer: validatedData.answer || '',
              Difficulty: validatedData.difficulty || '',
              Company: validatedData.company || '',
            },
          });

          // Upsert interview resource details to Pinecone
          await interviewIndex.upsert(vectors);

          importResults.successful++;
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errorDetails = validationError.errors
              .map((err) => {
                const path = err.path.join('.');
                return `Field '${path}': ${err.message}`;
              })
              .join(', ');
            console.error(`Row ${index + 1} validation error:`, errorDetails);
            importResults.errors.push(`Row ${index + 1}: ${errorDetails}`);
          }
          throw validationError;
        }
      } catch (error) {
        importResults.failed++;
        if (error instanceof z.ZodError) {
          const errorDetails = error.errors
            .map((err) => {
              const path = err.path.join('.');
              return `Field '${path}': ${err.message}`;
            })
            .join(', ');
          importResults.errors.push(`Row ${index + 1}: ${errorDetails}`);
        } else {
          importResults.errors.push(`Row ${index + 1} error: ${error}`);
        }
      }
    }

    // Revalidate the path
    revalidatePath('/interview-resources');

    return {
      success: true,
      message: 'Bulk import of interview resources completed',
      results: importResults,
    };
  } catch (error) {
    console.error('Error in bulk import of interview resources:', error);
    return {
      success: false,
      message: 'Failed to perform bulk import of interview resources',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function importDataFromExcel() {
  try {
    const interviewFilePath = path.join(
      process.cwd(),
      'src',
      'InterviewQuestions.csv'
    );

    console.log('Attempting to import from:', {
      interviewPath: interviewFilePath,
    });

    const interviewResult =
      await bulkImportInterviewResources(interviewFilePath);
    console.log('Interview Resources Import Result:', interviewResult);

    return {
      interviewResources: interviewResult,
    };
  } catch (error) {
    console.error('Complete import error:', error);
    throw error;
  }
}
