import { importDataFromExcel } from "@/actions/onProgram";
import { NextResponse } from "next/server";
//search for this to run on your browser to dump the data but if you do it again and again, db is fucked!!
// http://localhost:3000/api/import
export async function GET() {
  try {
    console.log('Starting import process...');
    
    const result = await importDataFromExcel();
    console.log('Import completed:', result);
    
    return NextResponse.json({
      success: true,
      interviewResourcesImported: result.interviewResources?.results?.successful || 0,
      totalInterviewResources: result.interviewResources?.results?.total || 0,
      failedInterviewResources: result.interviewResources?.results?.failed || 0,
      message: result.interviewResources?.message || "Import completed"
    });
  } catch (error) {
    console.error('API Import Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        fullError: error
      },
      { status: 500 }
    );
  }
}