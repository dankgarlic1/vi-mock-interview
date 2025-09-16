"use server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { candidateDataSchema } from "@/lib/zod";
import { z } from "zod";

type CandidateDataFormType = z.infer<typeof candidateDataSchema>;

export async function uploadCandidateInfo(formData: CandidateDataFormType) {
  try {
    const validatedData = candidateDataSchema.parse(formData);
    console.log(`Validated Data: ${validatedData}`)
    const session = await getServerSession();
    console.log(`Session: ${session}`)
    if (!session) {
      throw new Error("You must be logged in to submit candidate information.");
    }

    const userEmail = session.user?.email;
    

    if (!userEmail) {
      throw new Error("User email not found in session.");
    }

    // Update user with validated data (do not overwrite email)
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        age: validatedData.age,
        nationality: validatedData.nationality,
        currentRole: validatedData.currentRole,
        yearsOfExperience: validatedData.yearsOfExperience,
        targetRole: validatedData.targetRole,
        skills: validatedData.skills,
        preferredCompanies: validatedData.preferredCompanies,
        careerGoals: validatedData.careerGoals,
        interviewPreferences: validatedData.interviewPreferences ?? "",
        filledProfile:true
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating candidate information:", error);
    throw new Error("There was an error updating the candidate information.");
  }
}
