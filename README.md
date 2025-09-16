# VI Mock Interview Agent

VI Mock Interview Agent is an AI-powered video platform designed for practicing mock interviews with smart feedback and question generation.

## Features

- **Interactive Video Interviews**: Engage in realistic face-to-face mock interviews with our AI interviewer
- **Technical & Behavioral Questions**: Practice both technical coding challenges and behavioral scenarios
- **Real-time Feedback**: Get instant feedback on your responses and body language
- **24/7 Availability**: Practice interviews whenever you need, at your own pace
- **Complete Privacy**: Your interview sessions are encrypted and secure

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Video**: LiveKit for real-time video communication
- **AI**: OpenAI GPT-4, Google Gemini for intelligent responses
- **Database**: Prisma with PostgreSQL (NeonDB)
- **Vector Database**: Pinecone for semantic search
- **Authentication**: NextAuth.js
- **File Upload**: UploadThing

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npm run start:prisma`
5. Start the development server: `npm run dev`

## Environment Variables

Make sure to set up the following environment variables:

- `LIVEKIT_API_KEY` - LiveKit API key for video functionality
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `DATABASE_URL` - PostgreSQL database URL
- `PINECONE_API_KEY` - Pinecone API key
- `OPENAI_API_KEY` - OpenAI API key
- `GEMINI_API_KEY` - Google Gemini API key
- `UPLOADTHING_SECRET` - UploadThing secret

## Usage

1. Sign up for an account
2. Complete your profile with relevant information
3. Choose between technical or behavioral interview practice
4. Start your mock interview session
5. Receive feedback and suggestions for improvement

## Contributing

This project is part of an internal hackathon. For questions or contributions, please contact the development team.

## License

This project is proprietary and confidential.
