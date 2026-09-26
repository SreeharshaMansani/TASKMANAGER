# Task Manager backend

Run `npm ci`, then `npm start` from this directory. Use `npm run dev` for reloads and `npm test` for the backend tests.

`src/server.js` starts Express and connects to MongoDB. API routes, authentication middleware, database models, configuration, and utilities have separate folders under `src/`. Tests live in `tests/`.

Settings are documented in [.env.example](.env.example). Environment loading is anchored to this directory: process variables take priority, then `.env.local`, then the legacy `data.env` file (or `.env` when that legacy file is absent). Keep credentials out of source code. Render continues to use this directory as its service root and `npm start` as its start command.
