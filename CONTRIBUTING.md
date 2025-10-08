# 🤝 Contributing Guidelines

Welcome to the **PRISM** project! This guide explains how every team member can safely collaborate, commit, and integrate their part without causing merge conflicts.

---

## 🧩 Team Workflow Overview

We’re using a **feature-branch workflow** to ensure smooth collaboration.

### ✅ Basic Flow

1. **Main Branch = Stable Code**
    - Only fully working features are merged into main.
    - No one commits directly to main.

2. **Feature Branch = Your Workspace**
    - Each developer creates their own branch for their assigned feature.
    - Example:
        - `feature/frontend-auth`
        - `feature/resume-parser`
        - `feature/question-generator`
        - `feature/stt`
        - `feature/evaluator`

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-org>/AI-Interview-Assistant.git
cd AI-Interview-Assistant
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Your Branch

```bash
git checkout -b feature/<your-feature>
```

For example:

```bash
git checkout -b feature/question-generator
```

---

## ✍️ Working on Your Feature

1. Make your changes in your branch.
2. Test locally with:

    ```bash
    npm run dev
    ```

3. Add and commit your changes:

    ```bash
    git add .
    git commit -m "Added <your-feature>"
    ```

4. Push your branch:

    ```bash
    git push origin feature/<your-feature>
    ```

---

## 🔄 Keeping Your Branch Updated

Before you push or create a pull request, **always sync with main**:

```bash
# Switch to main and pull latest changes
git checkout main
git pull origin main

# Go back to your branch
git checkout feature/<your-feature>

# Merge main into your branch
git merge main
```

If merge conflicts appear, fix them locally, test again, commit, and push.

---

## 🔁 Submitting Your Work (Pull Requests)

When your feature is complete:

1. Push your branch:

    ```bash
    git push origin feature/<your-feature>
    ```

2. Go to **GitHub → Pull Requests → New Pull Request**
    - **Base branch:** main
    - **Compare branch:** your feature branch

3. Add a title and short description (what you changed, tested, integrated).

4. After review, your code will be merged into main.

---

## 🧠 Integration Guidelines

Each teammate integrates their part via **Next.js API routes**.

| Module            | Folder / File                        | Integration Tip                                                                 |
|-------------------|--------------------------------------|---------------------------------------------------------------------------------|
| Resume Parser     | `src/app/api/resume/route.ts`        | Use `fetch()` to send uploaded resume data to your model’s Flask/FastAPI endpoint. |
| Question Generator| `src/app/api/interview/route.ts`     | Return JSON with AI-generated questions.                                         |
| Speech-to-Text    | `src/app/api/interview/route.ts`     | Handle audio upload → call your STT model API → return text.                     |
| Evaluation Model  | `src/app/api/interview/route.ts`     | Receive user answers → send to model → return score/feedback.                    |

> All APIs should **return JSON** like:

```json
{
  "success": true,
  "data": { ... }
}
```

---

## ⚙️ Code Style & Naming Conventions

| Type           | Convention           | Example                        |
|----------------|---------------------|--------------------------------|
| Branch name    | `feature/<feature>` | `feature/resume-parser`        |
| Commit message | short & meaningful  | `Added Resume upload API`      |
| Folder names   | lowercase           | `/components`, `/models`       |
| File names     | lowercase/camelCase | `resumeUpload.tsx`             |
| Variables      | camelCase           | `userData`, `resumeFile`       |
| Components     | PascalCase          | `Navbar.tsx`, `Dashboard.tsx`  |

---

## 💡 Tips for Smooth Collaboration

- 🔄 Pull from main **daily** to stay updated
- 🧪 Test your pages before pushing
- 🧍 Commit only your own work
- 💬 Use GitHub Pull Request comments for discussions
- 🧹 Don’t push `node_modules` (it’s in `.gitignore`)

---

## 🧾 Example Workflow Summary

```bash
# 1. Clone
git clone https://github.com/<your-org>/AI-Interview-Assistant.git

# 2. Create branch
git checkout -b feature/stt

# 3. Work locally
npm run dev

# 4. Commit changes
git add .
git commit -m "Integrated speech-to-text model API"

# 5. Sync with main
git checkout main
git pull origin main
git checkout feature/stt
git merge main

# 6. Push and create PR
git push origin feature/stt
```