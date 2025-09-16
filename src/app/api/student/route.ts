import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { candidateDataSchema } from "@/lib/zod";
import { generateCandidateDetails } from "@/lib/constant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = candidateDataSchema.parse(body);

    // Ensure email is present (should be by schema)
    if (!parsedData.email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const candidate = await prisma.user.create({
      data: parsedData,
    });
    console.log('candidate:', candidate)

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating candidate", error: error },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    try {
      const candidate = await prisma.user.findUnique({
        where: { id: id },
      });

      if (!candidate) {
        return NextResponse.json(
          { message: "Candidate not found" },
          { status: 404 }
        );
      }

      const candidateDetails = generateCandidateDetails(candidate);

      return NextResponse.json(
        { message: "Candidate details retrieved successfully", details: candidateDetails },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching candidate:", error);
      return NextResponse.json(
        { message: "Error fetching candidate", error: error },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Please provide a valid candidate ID" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    const parsedData = candidateDataSchema.omit({ interviewPreferences: true }).parse(body);

    const candidate = await prisma.user.update({
      where: { id },
      data: parsedData,
    });

    return NextResponse.json({ candidate }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating candidate", error: error },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Candidate ID is required" },
      { status: 400 }
    );
  }

  try {
    const candidate = await prisma.user.delete({
      where: { id:id },
    });

    return NextResponse.json(
      { candidate, message: "Candidate deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting candidate", error: error },
      { status: 400 }
    );
  }
}
