# 🗄️ Backend & User Persistence Phase Documentation

## 1. Overview
This is the **"Memory"** phase of our application. Before this phase, our AI Vision Trainer was a purely frontend app—meaning it could track your push-ups perfectly using the camera, but the moment you hit "Refresh," all your hard work disappeared. 

In this phase, we connected a **Backend Database and Authentication System**. Now, users can log securely into their own accounts, save their workout data permanently, and track their fitness journey over time.

## 2. Why this phase is needed?
- **The Problem:** Frontend apps run locally in your browser. Data inside React states (like `reps = 10`) gets completely lost on a page refresh or when the browser closes.
- **The Backend Solution:** We needed a secure external server (a database) to permanently save this data under a specific user profile so they can retrieve it on any device at any time.

## 3. High-Level Architecture
Here is the simple data journey of the application:
```text
👤 User does a workout 
   ↓
💻 Frontend (React APP calculates reps via Camera)
   ↓
🔑 Authentication (Supabase checks who the user is)
   ↓
📡 Backend API Call (Sends pure data like: { reps: 15, type: 'push-up' })
   ↓
🗄️ Database (PostgreSQL permanently saves it in tables)
   ↓
📊 UI (History Dashboard fetches and displays data)
```

## 4. Authentication System
- **Tool Used:** **Supabase Auth** (A modern, secure alternative to Firebase).
- **How it works:** 
  1. The user enters their email/password (or uses Social Login like Google).
  2. Supabase verifies the credentials securely.
  3. Supabase gives the frontend a secure "Key" called a **Token* or a **Session**.
- **What is a "Session"?** Think of a session like a movie theater ticket. Once you buy it (login), you get a ticket (session). Every time you want to enter a new screen or save data, you show the ticket. Our `AuthContext` holds this ticket so the user stats stay logged in automatically.

## 5. Database Design
- **Tool Used:** **PostgreSQL** hosted exactly inside Supabase. PostgreSQL is a relational database—meaning data is stored in strict, organized tables (like Excel sheets) that relate to each other.
- **Tables Created:**
  - **`users`** (Managed directly by Supabase Auth for security).
  - **`workout_sessions`**: The main summary of the day.
    - Fields: `id`, `user_id` (who did it), `start_time`, `end_time`, `total_reps`, `good_reps`, `bad_reps`.
  - **`exercise_sets`**: The detailed breakdown connected to the session.
    - Fields: `id`, `session_id` (connects back to the main session), `exercise_type` (e.g., Push-ups, Squats), `reps`.

## 6. Backend/Data Flow
**Saving the Data:**
1. When the user finishes their workout, React compiles a `session` object.
2. The frontend calls our `saveWorkoutSession` function.
3. This function checks if the user is verified.
4. It then pushes the summary data into `workout_sessions` table.
5. Finally, it takes the ID of the new session and pushes the individual exercises into `exercise_sets` connected to that ID.

**Fetching the Data:**
When the user visits the `/history` page, the application asks Supabase: *"Give me all workout_sessions for THIS user, and 'Join' their exercise sets so I have the full picture."*

## 7. File & Folder Structure (VERY IMPORTANT)
Here is where the magic happens in our codebase:

* **`src/lib/supabase.ts`**
  - **Purpose**: The connection cable.
  - **What it does**: It takes our secret keys (from `.env` files) and creates a `supabase` client. Everywhere else in the app imports this client to talk to the database.

* **`src/context/AuthContext.tsx`**
  - **Purpose**: The global user memory.
  - **What it does**: It listens to Supabase constantly. If Supabase says "User logged in", it stores the `user` globally. If the user logs out, it clears it. It prevents uninvited guests from seeing private pages.

* **`src/services/workoutService.ts`**
  - **Purpose**: The Database Manager for workouts.
  - **What it does**: It contains the `saveWorkoutSession()` logic. Instead of writing messy database queries inside our shiny React UI components, we write them here. It keeps code clean.

* **`src/pages/History.tsx`**
  - **Purpose**: The user dashboard.
  - **What it does**: It runs a single Supabase `.select()` query when the page opens to fetch past workouts. It maps over that data to display beautiful "Cards" showing workout accuracy and time.

## 8. History Dashboard
- **How data is used:** We pull timestamps (`start_time`), convert them to readable days (like "Wed, Oct 12"), and do simple math (`good_reps / total_reps`) to calculate an **Accuracy %**.
- **Insights Shown:** The UI explicitly displays the duration of the workout, exact reps per exercise, and whether the form was generally "Good" or "Bad".

## 9. Key Concepts Explained (Beginner Friendly)
- **API (Application Programming Interface):** The waiter at a restaurant. Your app (the customer) tells the API what it wants, the API goes to the Database (the kitchen), and brings the data back to you.
- **Database:** A highly organized digital filing cabinet. We use "Relational SQL" which means our files are linked logically (e.g., this User owns these Workouts).
- **Authentication vs. Authorization:** Authentication is proving *who* you are (Login). Authorization is proving *what* you're allowed to do (e.g., you can only delete *your own* workouts, not someone else's).
- **CRUD Operations:** The 4 basic things a backend does: **C**reate (save a workout), **R**ead (view history), **U**pdate (change a profile), **D**elete (remove bad data).

## 10. Challenges & Solutions
- **Challenge:** Handling broken internet connections while submitting a workout.
- **Solution:** We structured our `try/catch` blocks inside `History.tsx` and `workoutService.ts`. If the database fails to save due to an error, we catch it gracefully and show the user a clean `error_message` string instead of crashing the app.
- **Challenge:** Avoiding messy data structures.
- **Solution:** We strictly separated `workout_sessions` (the summary) from `exercise_sets` (the granular data). This prevents duplicate rows in our database and allows scaling if we ever want to add 100 new exercises.

## 11. How to Explain This in an Interview
*"Our app started purely locally in the browser, meaning data vanished on refresh. To resolve this and add SaaS capabilities, I integrated Supabase as a Backend-as-a-Service (BaaS). I set up an AuthContext in React to globally manage secure user sessions. For data persistence, I designed a normalized PostgreSQL database utilizing two tables: one for the workout session summary and another for individual set execution. When a workout finishes, our services layer pushes this data to the database, which is subsequently queried to build a historical progress dashboard for the user."*
