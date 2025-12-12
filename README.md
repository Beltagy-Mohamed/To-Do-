# Beltagy To-Do App 🚀

A modern, aesthetically pleasing To-Do application with productivity features, Arabic language support, and a comprehensive Athkar (Supplications) section.

## Features
- **Smart Task Management**: Categorize by Personal, Work, Creative, or Urgent.
- **Productivity Tools**: Pomodoro Timer, Analytics (Charts), and XP Gamification.
- **Athkar Section**: Morning and Evening supplications with an interactive counter and progress tracking.
- **Bilingual Interface**: Full support for English and Arabic (RTL).
- **Guest Mode**: Use the app offline without a backend.
- **Cloud Sync**: Optional Firebase integration for cross-device sync.

## 🌍 How to Deploy to GitHub Pages

This application is built with standard web technologies (HTML/CSS/JS) and is ready for GitHub Pages.

1.  **Push to GitHub**:
    -   Initialize a git repository: `git init`
    -   Add files: `git add .`
    -   Commit: `git commit -m "Initial commit"`
    -   Push to your repository.

2.  **Enable GitHub Pages**:
    -   Go to your Repository **Settings**.
    -   Navigate to the **Pages** section.
    -   Under **Build and deployment**, select **Source** as `Deploy from a branch`.
    -   Select your `main` branch and `/` (root) folder.
    -   Click **Save**.

3.  **Done!**
    -   Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## 🛠️ Configuration

### Firebase (Optional)
To enable cloud sync, edit `firebase-config.js` with your own Firebase Project keys.
If you don't provide keys, the app automatically enables **Guest Mode** (Local Storage only).

### Running Locally
To run the app locally on your computer, double-click `start_server.bat`.
This launches a local Python server to bypass browser security restrictions.
