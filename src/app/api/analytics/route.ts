import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching fresh data from the database');
    
    const totalUsers = await prisma.user.count();

    const usersWithProfiles = await prisma.user.count({
      where: {
        filledProfile: true,
      },
    });

    const interviewResourcesByRole = await prisma.interviewResource.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const topInterviewResources = await prisma.interviewResource.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        question: true,
        role: true,
        difficulty: true,
      },
    });

    const recentChats = await prisma.chat.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
    });

    const activeSessions = await prisma.session.count();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalUsers,
          usersWithProfiles,
          interviewResourcesByRole,
          topInterviewResources,
          recentChats,
          activeSessions,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch admin dashboard data',
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
