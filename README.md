# Task Manager

Independent React application and Express API, with an optional chatbot widget.

## Layout

```text
taskmanager/
  backend/
    src/
      config/       # Environment loading and MongoDB connection
      middleware/   # Authentication middleware
      models/       # Mongoose models
      routes/       # API endpoints
      utils/        # Shared backend logic
      server.js     # API entry point
    tests/          # Backend tests
  frontend/
    src/
      assets/       # Images
      components/   # Layout, feedback, and task components
      context/      # Task contexts and state providers
      hooks/        # Shared React hooks
      integrations/ # Host adapter for the chatbot widget
      pages/        # Route-level screens
      styles/       # Application styles
      utils/        # Shared frontend helpers
      __tests__/    # React and integration tests
      App.js        # Routes and providers
      index.js      # React entry point
    public/         # Static browser assets
    vendor/         # Installable widget releases
  docs/             # Development and integration guide
  logs/             # Ignored local runtime logs
```

## Run

From this directory, run `npm run setup` to install both applications. Keep backend credentials in `backend/.env.local` and browser settings in `frontend/.env`; see each application's `.env.example`.

Run these commands in separate terminals:

```powershell
npm run start:backend
npm run start:frontend
```

The frontend runs on port 3000 and the API on port 5000. Use `npm run dev:backend` for API reloads. Commands inside `backend/` and `frontend/` also work. Restart running development servers after the directory moves.

## Verify

```powershell
npm test
npm run build
```

Individual checks: `npm run test:backend` and `npm run test:frontend`. The frontend build is written to `frontend/build/`.

## Chatbot integration

The chatbot UI is maintained separately in `chatbot/frontend/`. This app installs its packaged widget from `frontend/vendor/`; the adapter is [TaskAssistant.jsx](frontend/src/integrations/TaskAssistant.jsx). Start the chatbot API from the separate chatbot root with `npm start` when using the assistant.

See the [development guide](docs/development.md), [frontend guide](frontend/README.md), and [backend guide](backend/README.md).
