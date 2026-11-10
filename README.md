# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Sign-in (optional)

Accounts are handled by Firebase Authentication. Without configuration the app runs in
guest mode and saves everything in the browser only; once keys are present, the personal
pages require sign-in and each account gets its own data in that browser.

1. Create a Firebase project, enable **Email/Password** and **Google** under Authentication →
   Sign-in method, and add a Web app.
2. Copy `.env.example` to `.env.local` and fill in the four `VITE_FIREBASE_*` values.
3. Restart the dev server. For the deployed build, set the same variables in the
   environment that runs `npm run deploy` (they are baked in at build time).

Goals and dreams are not uploaded — the SDK is only used for sign-in, and its code is
code-split so guest builds never download it.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
