# Voice-Enabled Task Tracker

A full-stack task management application inspired by Linear, featuring intelligent voice input that parses natural language to create tasks with structured fields (title, description, priority, due date, status).

##  Features

- **Voice Task Creation**: Speak naturally to create tasks - the system intelligently extracts task details
- **Kanban Board View**: Drag-and-drop tasks between columns (To Do, In Progress, Done)
- **List View**: Traditional list view with all task details
- **Manual Task Creation**: Full CRUD operations for tasks
- **Filtering & Search**: Filter by status, priority, due date, or search by title/description
- **Intelligent Parsing**: Uses AI to extract structured data from natural language

##  Project Structure

```
project/
├── backend/          # Node.js + Express + PostgreSQL backend
├── frontend/         # React + Vite frontend
└── README.md         # This file
```

##  Project Setup

### Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **PostgreSQL**: v12+ installed and running
- **API Keys**:
  - Deepgram API key (for speech-to-text)
  - OpenRouter API key (for text parsing)
- **Note**:
  -Rename the env file from **.env.example** to **.env** 

### Install steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/murshidalam7474/VoiceEnabledTaskTracker-Assignment-Aerchain.git
   cd project
   ```

2. **Install & configure Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/voice_task_tracker"
   PORT=4000
   DEEPGRAM_API_KEY="your-deepgram-api-key"
   OPENROUTER_API_KEY="your-openrouter-api-key"
   ```
   
   Create database and run migrations:
   ```bash
   # Create database in PostgreSQL
   psql -U postgres
   CREATE DATABASE voice_task_tracker;
   \q
   
   # Run Prisma migrations
   npx prisma migrate dev --name init
   ```

3. **Install & configure Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### How to configure email sending/receiving

- **Current implementation**: Email sending/receiving is **not implemented** in this assignment.
- All task creation and updates happen via the **web UI** (manual forms + voice input).
- If extended in the future, a transactional email provider (e.g., SendGrid, SES, Resend) can be integrated from the backend to:
  - Send notification emails when tasks are created/updated.
  - Optionally parse inbound emails into tasks (out of current scope).

### How to run everything locally

1. **Start Backend** (from `backend/` directory)
   ```bash
   npm run dev
   ```
   Backend runs on `http://localhost:4000`

2. **Start Frontend** (from `frontend/` directory)
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Open Browser**
   Navigate to `http://localhost:5173`

### Seed data / initial scripts

- There is **no mandatory seed data**; the app starts with an empty `Task` table.
- The committed Prisma migration in `backend/prisma/migrations/20251203154651_init/` is used by Prisma to create the database schema.
- Running `npx prisma migrate dev --name init` (or simply `npx prisma migrate dev` after pulling the code) will apply these migrations and create all required tables and enums.


## 📚 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Speech-to-Text**: Deepgram API
- **Text Parsing**: OpenRouter (GPT-OSS-20B)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 (Custom)

## 📖 API Documentation

### Base URL
`http://localhost:4000/api`

### Endpoints

#### Tasks

**GET /api/tasks**
- Get all tasks with optional filters
- Query params: `status`, `priority`, `dueDate`, `search`
- Success: `200 OK` with array of tasks
- Errors:
  - `400 Bad Request` for invalid query parameters
  - `500 Internal Server Error` for unexpected failures

**GET /api/tasks/:id**
- Get single task by ID
- Success: `200 OK` with task object
- Errors:
  - `404 Not Found` when the task does not exist

**POST /api/tasks**
- Create a new task
- Body: `{ title, description?, status?, priority?, dueDate? }`
- Success: `201 Created` with task object
- Errors:
  - `400 Bad Request` when `title` is missing or invalid

**PUT /api/tasks/:id**
- Update a task
- Body: `{ title?, description?, status?, priority?, dueDate? }`
- Success: `200 OK` with updated task object
- Errors:
  - `400 Bad Request` for invalid fields
  - `404 Not Found` when the task does not exist

**DELETE /api/tasks/:id**
- Delete a task
- Success: `204 No Content`
- Errors:
  - `404 Not Found` when the task does not exist

#### Speech-to-Text

**POST /api/speech-to-text**
- Convert audio to text using Deepgram
- Body: Raw audio file (WebM format)
- Success: `200 OK` with `{ transcript: string }`
- Errors:
  - `400 Bad Request` when no audio is received
  - `502 Bad Gateway` when Deepgram fails or returns no transcript

#### Parse

**POST /api/parse**
- Parse natural language transcript into structured task data
- Body: `{ transcript: string }`
- Success: `200 OK` with `{ transcript, parsed: { title, description, priority, status, dueDate } }`
- Errors:
  - `400 Bad Request` when transcript is missing
  - `500 Internal Server Error` for unexpected parsing failures
  - `502 Bad Gateway` when the parser returns an invalid response

##  User Flows

### Flow 1: Manual Task Creation
1. Click "Add Task" button
2. Fill in form fields (title, description, status, priority, due date)
3. Click "Save"
4. Task appears in appropriate column/list

### Flow 2: Voice Task Creation
1. Click microphone icon
2. Speak: "Create a high priority task to review the pull request by tomorrow evening"
3. Click "Stop Recording"
4. Review parsed fields in modal (transcript, title, priority, due date)
5. Edit if needed, then click "Create Task"
6. Task appears on board

### Flow 3: Task Update
1. Click on existing task
2. Edit fields in modal
3. Click "Save"
4. Task updates in real-time

### Flow 4: Drag-and-Drop (Kanban)
1. Drag task card from one column to another
2. Task status updates automatically
3. Changes persist to database

## 🔧 Decisions & Assumptions

### Design Decisions

1. **Database Schema**: Used Prisma ORM with PostgreSQL for type safety and migrations
   - Task model includes: id, title, description, status, priority, dueDate, timestamps
   - Enums for Status (TO_DO, IN_PROGRESS, DONE) and Priority (LOW, MEDIUM, HIGH, CRITICAL)

2. **Voice Input Flow**: Two-step process
   - First: Speech → Text (Deepgram)
   - Second: Text → Structured Data (OpenRouter)
   - This separation allows for better error handling and user review

3. **Frontend Architecture**: Single-page application with React
   - No state management library (Redux) needed for this scope
   - Component-based architecture for reusability

4. **API Design**: RESTful endpoints following REST conventions
   - Proper HTTP methods and status codes
   - Consistent error responses

### Assumptions

1. **Single User**: No authentication required (as per assignment scope)
2. **Audio Format**: Browser MediaRecorder produces WebM format (widely supported)
3. **Date Parsing**: AI model handles relative dates ("tomorrow", "next Monday") based on current date
4. **Default Values**: 
   - Status defaults to "TO_DO"
   - Priority defaults to "MEDIUM"
   - Description is optional

### Limitations

1. **Audio Quality**: Depends on microphone quality and browser support
2. **Parsing Accuracy**: AI parsing may require user correction for complex inputs
3. **Date Parsing**: Relative dates are interpreted based on server time
4. **No Real-time Updates**: Changes require page refresh or manual state update

## 🤖 AI Tools Usage

### Tools Used During Development

1. **Cursor AI** (Primary assistant during development)
   - **Purpose**: Frontend UI help, boilerplate suggestions, and debugging support
   - **Frontend Usage**: 
     - Helped design and refine the React UI (layouts, components, styling)
     - Assisted with wiring API calls and handling loading/error states
     - Suggested improvements to UX flows (voice recording, modals, filters)
   - **Backend Usage**:
     - Used mainly for **ideation and small refactors**, especially around parsing prompts and error handling.
     - Core backend logic, models, and routes were **implemented manually(No AI Help in backend)**.
   - **Notable Prompts**:
     - "Design a clean React UI for a Linear-style task tracker with kanban style board and list views"
     - "Suggest a robust prompt for parsing natural language task descriptions into structured fields"
     - "Help debug why a voice recording flow is failing in the browser"

2. **OpenRouter** (Runtime)
   - **Model**: `openai/gpt-oss-20b:free`
   - **Purpose**: Parse natural language transcripts into structured task data
   - **Implementation**: Custom prompt engineering to extract title, description, priority, status, and due date

3. **Deepgram** (Runtime)
   - **Purpose**: Convert audio recordings to text transcripts
   - **Implementation**: Direct API integration for real-time transcription

### What Changed Because of AI Tools

1. **Faster Development**: AI tools helped generate boilerplate code quickly
2. **Better Error Handling**: AI suggestions improved error handling patterns
3. **Code Quality**: AI-assisted refactoring improved code organization
4. **Prompt Engineering**: Iterative improvements to parsing prompts for better accuracy

##  Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
PORT=4000
DEEPGRAM_API_KEY="your-deepgram-api-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
```

