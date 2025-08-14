# CodeX

## Overview

CodeX is a full-stack web application that allows users to generate code instantly by providing natural language prompts. It acts as an AI-powered coding assistant, helping developers, students, and hobbyists turn ideas into executable code with live previews. The application integrates a secure backend, real-time updates, and a sandbox environment for immediate code testing.

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Ensure you have the following installed on your system:

| Tool         | Version  |
|--------------|----------|
| **Node.js**  | >= 18.x  |
| **npm**      | >= 8.x   |
| **Git**      | Latest   |
| **NeonDb** | >= 14.x |

---

### 2️⃣ Features

CodeGenAI offers powerful features to simplify coding and learning:

- **Prompt-Based Code Generation**: Enter a description of your desired functionality and get generated code instantly.
- **Live Preview in Sandbox**: View and test generated code in an isolated environment.
- **Project Management**:
  - Save multiple generated code projects.
  - Organize and edit code snippets.
- **Version History**: Keep track of previous generations and changes.
- **Secure User Authentication**: Login and manage personal code libraries protected by Clerk.
- **NeonDb + Prisma Backend**: Scalable and reliable database for storing projects, messages, and code fragments.

---

### 3️⃣ Setup Instructions

#### Clone the Repository

```bash
git clone https://github.com/Jagpreet153/CodeX.git
cd codex

```
### Install Dependencies

```bash
npm install
```

### 4️⃣ Tech stacks 

#### Frontend:

Next.js — React framework for SSR, SSG, and fast UI rendering.

Tailwind CSS — Utility-first CSS framework for styling.



#### Backend:
tRPC — End-to-end typesafe APIs.

Prisma ORM — Simplified database schema and queries.

Neon — Serverless PostgreSQL database.

Clerk — Authentication and user management.

#### Other:
Sandbox — Isolated environment to execute and preview generated code securely.

### 5️⃣: Run the Application

```bash
npm run dev
```

