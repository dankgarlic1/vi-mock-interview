import { PrismaClient, User, Session } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Creating Users with interview-focused data
  const users: User[] = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        emailVerified: new Date(),
        image: faker.image.avatar(),
        phone: faker.phone.number(),
        age: faker.number.int({ min: 18, max: 65 }),
        nationality: faker.location.country(),
        currentRole: faker.helpers.arrayElement(['Software Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Data Scientist']),
        yearsOfExperience: faker.number.int({ min: 0, max: 15 }),
        targetRole: faker.helpers.arrayElement(['Backend Engineer', 'Frontend Engineer', 'DevOps']),
        skills: faker.helpers.arrayElement(['JavaScript, React, Node.js', 'Python, Django, PostgreSQL', 'AWS, Docker, Kubernetes', 'Java, Spring Boot, MySQL']),
        preferredCompanies: faker.helpers.arrayElement(['Google, Meta, Amazon', 'Microsoft, Apple, Netflix', 'Uber, Airbnb, Stripe']),
        careerGoals: faker.lorem.sentence(),
        interviewPreferences: faker.helpers.arrayElement(['Technical focus', 'Behavioral focus', 'System design focus', 'Coding challenges']),
        filledProfile: faker.datatype.boolean(),
        totalTimeUsed: faker.number.int({ min: 0, max: 120 }), 
        plan: faker.helpers.arrayElement(['FREE', 'PRO', 'ENTERPRISE']),
      },
    });
    users.push(user);
  }

  // Creating Sessions
  const sessions: Session[] = [];
  for (let i = 0; i < 10; i++) {
    const session = await prisma.session.create({
      data: {
        userId: users[i].id,
        duration: faker.number.int({ min: 10, max: 60 }), 
        summary: faker.lorem.sentence(),
      },
    });
    sessions.push(session);
  }

  // Creating Chat messages
  for (const session of sessions) {
    for (let i = 0; i < 5; i++) {
      await prisma.chat.create({
        data: {
          sessionId: session.id,
          sender: faker.helpers.arrayElement(['USER', 'AI']),
          message: faker.lorem.sentence(),
        },
      });
    }
  }

  // Creating Interview Resources
  const interviewQuestions = [
    {
      role: 'Backend Engineer',
      question: 'Explain the difference between REST and GraphQL APIs.',
      answer: 'REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint with queries to specify exactly what data is needed.',
      difficulty: 'Medium',
      company: 'Google'
    },
    {
      role: 'Frontend Engineer', 
      question: 'What is the Virtual DOM in React?',
      answer: 'The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance by minimizing direct DOM manipulations.',
      difficulty: 'Easy',
      company: 'Meta'
    },
    {
      role: 'DevOps',
      question: 'Explain the difference between Docker and Kubernetes.',
      answer: 'Docker is a containerization platform that packages applications, while Kubernetes is an orchestration platform that manages containerized applications.',
      difficulty: 'Medium',
      company: 'Amazon'
    },
    {
      role: 'Backend Engineer',
      question: 'How would you design a URL shortening service?',
      answer: 'Use a hash function to generate short URLs, store mappings in a database, implement caching with Redis, and handle redirects efficiently.',
      difficulty: 'Hard',
      company: 'Bitly'
    },
    {
      role: 'Frontend Engineer',
      question: 'What are the benefits of using TypeScript over JavaScript?',
      answer: 'Static typing, better IDE support, early error detection, improved code maintainability, and better documentation through types.',
      difficulty: 'Easy',
      company: 'Microsoft'
    }
  ];

  for (const question of interviewQuestions) {
    await prisma.interviewResource.create({
      data: question,
    });
  }

  console.log('Seed data created successfully!');
  console.log(`Created ${users.length} users`);
  console.log(`Created ${sessions.length} sessions`);
  console.log(`Created ${interviewQuestions.length} interview resources`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 