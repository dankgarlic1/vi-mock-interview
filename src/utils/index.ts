
import { NEXT_AUTH } from "@/lib/auth";
// @ts-ignore 
import { AuthOptions ,getServerSession} from "next-auth";

import prisma from "@/lib/prisma";

export const getUserDetails = async () => {
  const session = await getServerSession(NEXT_AUTH as AuthOptions);
  return session;
};

export async function loginAdmin({ email, password }: { email: string; password: string }) {
  const response = await fetch('/api/admin/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  console.log('response:', response)

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return await response.json();
}


export async function createProgramAction(formData: FormData) {
    try {
        const program = await prisma.program.create({
            data: {
                name: formData.get('name') as string,
                description: formData.get('description') as string || "",
                mode: formData.get('mode') as string || "",
                duration: formData.get('duration') as string || "",
                category: formData.get('category') as string || "",
                fees: formData.get('fees') as string || "",
                eligibility: JSON.stringify({
                    ugBackground: formData.get('ugBackground') as string || "",
                    minimumGpa: formData.get('minimumGpa') as string || "",
                    backlogs: Number(formData.get('backlogs')) || 0,
                    workExperience: formData.get('workExperience') as string || "",
                    allow3YearDegree: formData.get('allow3YearDegree') as string || "",
                    decisionFactor: formData.get('decisionFactor') as string || "",
                }),
                ranking: formData.get('ranking') as string || "",
                university: formData.get('university') as string,
                college: formData.get('college') as string || "",
                location: formData.get('location') as string || "",
                publicPrivate: formData.get('publicPrivate') as string || "",
                specialLocationFeatures: formData.get('specialLocationFeatures') as string || "",
                specialUniversityFeatures: formData.get('specialUniversityFeatures') as string || "",
                specialization: formData.get('specialization') as string || "",
                usp: formData.get('usp') as string || "",
                curriculum: formData.get('curriculum') as string || "",
                coOpInternship: formData.get('coOpInternship') as string || "",
                transcriptEvaluation: formData.get('transcriptEvaluation') as string || "",
                lor: formData.get('lor') as string || "",
                sop: formData.get('sop') as string || "",
                interviews: formData.get('interviews') as string || "",
                applicationFee: formData.get('applicationFee') ? String(formData.get('applicationFee')) : null,
                deposit: formData.get('deposit') ? String(formData.get('deposit')) : null,
                depositRefundableVisa: formData.get('depositRefundableVisa') as string || "",
                keyCompaniesHiring: formData.get('keyCompaniesHiring') as string || "",
                keyJobRoles: formData.get('keyJobRoles') as string || "",
                quantQualitative: formData.get('quantQualitative') as string || "",
            },
        });

        return { success: true, program };
    } catch (error) {
        console.error('Error creating program:', error);
        return { success: false, error: 'Failed to create program' };
    }
}