'use server'

import prisma from '@/lib/prisma'; 

export async function checkCandidateApplicationFilled(email: string): Promise<boolean> {
  try {
    const application = await prisma.user.findUnique({
      where: {email: email },
      select: { filledProfile: true }
    });

    return application?.filledProfile ?? false;
  } catch (error) {
    console.error('Error checking student application:', error);
    return false;
  }
}