## ⚠️ Project Archived (But Still Special to Me)

> This project is one of the closest things I’ve built.
>
> I worked on it during my internship for a company hackathon, where I was the only developer on my team. We ended up winning **1st place in my second week**, which made this project even more meaningful to me.
>
> It became a core part of my resume and something I genuinely enjoyed building and presenting.

---

### 🚧 What happened?

HeyGen sunset their API and introduced the new **Live Avatar** system:

- 🔗 Migration guide: https://docs.liveavatar.com/docs/interactive-avatar-migration-guide  
- 💰 Pricing: https://docs.liveavatar.com/docs/credits-and-subscriptions  

I **successfully migrated the system from HeyGen to Live Avatar**, including:

- Real-time avatar session handling (**LiveKit**)  
- Event-driven voice interaction loop  
- Integration with a **RAG-based interview engine**  

---

### 💸 Why it’s still archived

While the migration is technically complete, the new **credit-based pricing model** is significantly more expensive per session.

This makes it difficult to:

- Run continuous demos  
- Maintain a publicly accessible version  
- Showcase the avatar feature reliably  

---

### 🧠 What still works

The **core system remains fully functional** and is the main highlight of this project:

- RAG-based interview question retrieval (Pinecone + embeddings)  
- Dynamic role-based interview flow  
- Context-aware conversational AI loop (follow-ups, adaptive questioning)  
- Real-time interaction pipeline  

---

### 🧩 Takeaway

> This project reflects a real-world engineering tradeoff:
>
> External platform changes can directly impact product feasibility, even when the system itself is technically sound.



---
### ❤️ Final note

This project still means a lot to me.

I may revisit it in the future if pricing or infrastructure constraints change.


<br/>

## 🏆 Hackathon Result
<p align="center">
  <img src="https://github.com/user-attachments/assets/1650357b-32c1-46ac-b8fd-2605695f3c18" width="500" />
</p>

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
