# Nexen AI

A modern full-stack application with AI capabilities.

## Getting Started on Windows

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nexen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `GEMINI_API_KEY` and other required variables.

### Running the App

#### Using VS Code (Recommended)

1. Open the project folder in VS Code.
2. Go to the **Run and Debug** view (Ctrl+Shift+D).
3. Select **Debug Server** and press F5.
4. The app will be available at `http://localhost:3000`.

#### Using Terminal

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## VS Code Extensions

For the best experience, we recommend installing the following extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
