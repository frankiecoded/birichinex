# Portmetals Africa - Developer Runbook
This is the official setup and deployment guide for the Portmetals Africa Wholesale fashion and entrepreneurship web ecosystem.

## Project Architecture
Portmetals Africa is engineered using a robust full-stack architecture combining a performant client-side single-page application built on React 19, Tailwind CSS, and Lucide React, paired with a reliable Node.js/Express server orchestrating server-side AI integrations using the `@google/genai` model client SDK.

### Key Directory Structure
- `/src/App.tsx`: Main client-side single-page application layout, state, and interaction patterns.
- `/src/components/`: Modular presentation components including navigation bars and styled page footer rails.
- `/src/utils.ts`: StaticReviewed Prices structures, premium compressed bale parameters, and multi-currency exchange formulas.
- `/src/types.ts`: Strictly typed TypeScript contracts for all domain objects.
- `/server.ts`: Express application server handling static bundle delivery, local simulation routines, and direct AI advisor pipelines.

---

## Technical Specifications & Stack
- **Runtimes:** Node.js v18/v20+
- **Frontend Framework:** React 19 (Strict Mode active)
- **Styling Pipeline:** Tailwind CSS
- **Iconography:** Lucide Icons
- **Animation Framework:** Motion (formerly framer-motion)
- **Backend API Server:** Express v4 with TSX runner
- **Core AI Engine:** `@google/genai` TypeScript SDK (using `gemini-3.5-flash` model aliases)

---

## Installation & Setup instructions

### 1. Install Project Dependencies
Run the package installations from the root of the project to retrieve dev dependencies and production packages:
```bash
npm install
```

### 2. Environment Variables Configuration
Configure a `.env` file at the root of the workspace using the structure outlined in `.env.example`:
```env
# Required for Amani's AI business advisor queries and live retail calculation projections
GEMINI_API_KEY="YOUR_OFFICIAL_GEMINI_API_KEY"

# Self-referential Linkages & callback handles
APP_URL="http://localhost:3000"
```

### 3. Run the Development Server
Launch the full-stack development runner combining the Express server and active Vite middleware:
```bash
npm run dev
```
The dev server runs on port `3000` by default. Browse the live preview at `http://localhost:3000`.

### 4. Compiling & Production Build
Create the production-ready static assets and compile the server bundle to the `dist/` directory:
```bash
npm run build
```
This runs `vite build` followed by a custom `esbuild` process to bundle the full-stack server into a clean CJS module.

### 5. Running in Production
After compiling, initiate the optimized node container to host the application:
```bash
npm start
```

---

## Security & Architectural Standards
- **Lazy Initialization:** The Gemini SDK is initialized on-demand inside the endpoint router context rather than boot-up time to prevent application crashes when the secret API key is missing.
- **Client-Side Data Integrity:** No sensitive database credentials or global configuration details are exposed to client browsers.
- **XSS & Injection Protection:** Clean request bodies are mapped securely using standard JSON express parsers and mapped strictly via strong TypeScript interfaces.
