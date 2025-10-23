# Developer Portfolio (React + TypeScript)

React + TypeScript + Vite + React Router, styled with CSS Modules. Mobile-first, accessible, and aligned to the assignment rubric.

## Scripts
- npm start — start dev server (quiet mode)
- npm run build — type-check and build (quiet mode)
- npm run preview — preview production build (quiet mode)

## Structure
- src/main.tsx — entry with BrowserRouter
- src/App.tsx — layout + routes
- src/components/* — Header, Footer, ScrollToTop, ThemeToggle
- src/sections/* — About, Projects, Skills
- src/data/projects.ts — typed project data
- src/data/profile.ts — profile information
- src/styles/globals.css — reset, variables, base styles

## Rubric mapping
- Structure: All required sections present and routed
- React: TS components, typed data, clean JSX
- Routing: React Router with NavLink active states, ScrollToTop
- Styling: CSS Modules, responsive layout, consistent spacing/typography
- Code Quality: Organized files, meaningful names
- Research: Self-configured Vite/Router/CSS documented here
- Personalization: Replace copy and images in sections and public/assets
- Bonus: Initialize Git and push to GitHub

## Personalize
Replace text in About section and update `src/data/projects.ts` and `src/data/profile.ts`. Add your own images under `public/assets/` with appropriate licensing.
