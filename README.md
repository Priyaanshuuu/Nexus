Nexus ⌘
A real-time collaborative workspace built for high-concurrency editing, offline resilience, and AI-augmented writing.
Link : https://nexus-1hn4.vercel.app/

⚡️ Overview
Nexus is not just a text editor; it is a distributed state system running in the browser. It allows multiple users to edit documents simultaneously with zero conflicts, powered by CRDTs (Conflict-free Replicated Data Types).

Unlike standard WebSocket implementations that blindly broadcast text, Nexus uses Yjs to merge state mathematically, ensuring that even if User A goes offline and User B keeps typing, their changes merge perfectly when User A reconnects.

🛠 Tech Stack
Core Infrastructure
Framework: Next.js 14 (App Router)

Language: TypeScript (Strict Mode)

Database: PostgreSQL (via Prisma ORM)

Auth: NextAuth.js (v5)

Real-Time Engine
Sync Engine: Yjs (CRDT for text consistency)

WebSocket Infrastructure: Liveblocks (Presence, Broadcast, Storage)

State Management: Zuztand + React Context

AI & Edge
LLM Integration: Google Gemini API (Streamed Responses)

Styling: Tailwind CSS + Shadcn UI

🔄 System Architecture & Workflow
1. The Real-Time Sync Loop (CRDTs)
Instead of sending whole documents, Nexus treats the document as a shared data type.

User Action: User types a character.

Local Update: The Y.Doc updates locally immediately (0ms latency).

Broadcast: The update is encoded as a binary Uint8Array and broadcast via Liveblocks to other connected clients.

Merge: Remote clients receive the binary delta and merge it into their local Y.Doc.

Result: No merge conflicts, ever.

2. The Offline-First "Smart Queue"
Network instability shouldn't lose data.

Detection: The app listens for navigator.onLine and WebSocket connection states.

Queuing: If disconnected, edits are stored in IndexedDB/Local Storage.

Reconciliation: Upon reconnection, the system pushes the queued "diffs" to the server.

3. AI Co-Pilot Workflow
User selects text and triggers "Summarize" or "Translate."

The selected context is sent to a Next.js Edge Function.

Gemini API streams the response back chunk-by-chunk directly into the editor node, allowing the user to watch the AI write in real-time.

🚀 Getting Started
1. Clone & Install
Bash

git clone https://github.com/yourusername/nexus.git
cd nexus
npm install
# or
pnpm install
2. Environment Setup
Create a .env.local file in the root:

Bash

# Public
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_live_...

# Secrets
LIVEBLOCKS_SECRET_KEY=sk_live_...
DATABASE_URL="postgresql://user:password@host/nexus"
NEXTAUTH_SECRET="your-auth-secret"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GEMINI_API_KEY="your-gemini-key"
3. Database Migration
Push the Prisma schema to your PostgreSQL instance:

Bash

npx prisma db push
npx prisma generate
4. Run Development Server
Bash

npm run dev
Visit http://localhost:3000 to see the app.

📂 Project Structure
Bash

├── app/
│   ├── (auth)/        # Route groups for authentication
│   ├── (root)/        # Main dashboard and document layout
│   ├── api/           # Liveblocks auth & AI endpoints
│   └── globals.css
├── components/
│   ├── editor/        # Tiptap & Yjs configuration
│   ├── collaborative/ # Cursors, ActiveUsers, Comments
│   └── shared/        # Reusable UI (Header, Loader)
├── lib/
│   ├── actions/       # Server Actions (Room management)
│   ├── liveblocks.ts  # Liveblocks client config
│   └── utils.ts       # CN and helper functions
├── prisma/
│   └── schema.prisma  # DB Schema
└── public/
🛡️ Key Features
Multi-Cursor Presence: See exactly where other users are typing in real-time.

Threaded Comments: Attach comments to specific text ranges (like Google Docs).

Document Management: Create, delete, and organize documents with RBAC (Role-Based Access Control).

Dark Mode: Fully supported UI with Shadcn.

🤝 Contributing
This is a personal portfolio project, but issues and PRs are welcome if you find a bug in the sync logic!

Built by Priyanshu Sinha
