# AI-Agent

A powerful AI agent project built with Node.js, This agent is designed to use a custom knowledge base (like your local documents or rules) to provide more accurate, up-to-date, and context-aware responses.

## Prerequisites

Before running the project, ensure you have the following installed:

* Node.js (v18 or higher recommended)
* npm (comes with Node.js)

## Installation and Setup

Follow these steps to get the project running locally:

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/tarunkumar-sys/AI-Agent.git
    cd AI-Agent
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables (API Key)**

There are two primary ways to set your `GEMINI_API_KEY`:

### A. Using a `.env` File (Requires `dotenv`)

For local development, the safest and cleanest method is to use a `.env` file with the popular `dotenv` package.

1.  **Install dotenv:**
    ```bash
    npm install dotenv
    ```
2.  **Create a `.env` file** in the root directory of your project and add your key:
    ```
    # .env file content
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
    ***Important:*** *The `.env` file is in your `.gitignore` and **must not** be committed to GitHub.*

### B. Command Line Export (Temporary Session)

Alternatively, you can set the key directly in your terminal session. This variable will be valid only for the duration of that specific terminal window.

| Operating System | Command |
| :--- | :--- |
| **Linux/macOS** | `export GEMINI_API_KEY="YOUR_API_KEY_HERE"` |
| **Windows (Command Prompt)** | `set GEMINI_API_KEY="YOUR_API_KEY_HERE"` |
| **Windows (PowerShell)** | `$env:GEMINI_API_KEY="YOUR_API_KEY_HERE"` |

## Usage

To start the main application:

```bash
# If using the .env file method (with 'dotenv' and a start script):
npm start

# If running directly (must use one of the configuration methods above):
node index.js

