# Task Manager

Task Manager is an independent application with its own Git repository, Express backend, React frontend, database configuration, dependencies, and tests. The chatbot is an optional integration with a separately running API; it is not the parent application.

## Project layout

```text
Desktop/
  taskmanager/
    backend/
    frontend/
  chatbot/
    backend/
    frontend/
```

## Start Task Manager

Run these in two separate PowerShell terminals:

```powershell
cd C:\Users\Dell\Desktop\taskmanager\backend
npm start
```

```powershell
cd C:\Users\Dell\Desktop\taskmanager\frontend
npm start
```

Open http://localhost:3000. The backend runs on port 5000. Run `npm install` in each directory if dependencies have not been installed.

Keep `MONGO_URI` and `JWT_SECRET` in `backend/.env.local`; `.env.example` documents the settings. Frontend settings belong in `frontend/.env`. Never expose database credentials or model-provider keys in frontend settings.

## Optional Task Assistant integration

The frontend installs `@task-assistant/widget` from `frontend/vendor/task-assistant-widget-1.0.3.tgz`. All chat UI and styles belong to the separate chatbot project; Task Manager only maintains `src/integrations/TaskAssistant.jsx`, a small adapter for its existing login and task refresh callbacks. The widget receives the current user session automatically and verifies it through the chatbot API. It has no second login and receives no passwords or private API keys. `REACT_APP_CHATBOT_URL` defaults to http://localhost:3001. To omit the integration, remove the `TaskAssistant` import and mount from `src/App.js`. Normal Task Manager screens do not depend on the chatbot service. The widget checks the chatbot health endpoint, disables its message controls while the API is unavailable, and reconnects automatically.

Start the assistant API in its own terminal only when using the integration:

```powershell
cd C:\Users\Dell\Desktop\chatbot
npm start
```

The chatbot uses `TASK_BACKEND_URL` (default http://localhost:5000/api) to access Task Manager. The two projects can live in unrelated directories or run on separate hosts; they share no source imports or node_modules directory.

## Verify

From `backend`, run `npm test`. From `frontend`, run `npm test -- --watchAll=false --runInBand` and `npm run build`.

Task Assistant's service tests and configuration are maintained separately in the chatbot project.

## Update the widget package

Run `npm run build` and `npm run pack:widget` from the separate chatbot project root. Releases are written to `chatbot/releases/widget/`. Copy the resulting tarball into this frontend's `vendor` directory and install it with `npm install ./vendor/task-assistant-widget-1.0.3.tgz` (use the new version filename for later releases). The checked-in tarball lets `npm ci` work without the chatbot source directory. Widget source and unit tests stay in the chatbot project; this application tests only its installed integration.


## Authentication and the chat trace

The host adapter supplies the signed-in user's token to the widget. For every chat request, the chatbot verifies that token through Task Manager's profile API and includes the verified display name in model context. A personalized greeting can therefore say "No tool was called": this trace lists model-selected tool executions, not authentication requests. Retrieved tools are candidates, and their scores are similarity rankings rather than confidence percentages.

The chatbot API starts independently, but currently has no standalone chat web page or separate login. Authenticated chat still requires this backend. Integrating another application requires compatible server-side authentication and task API adapters.

Routine application feedback uses small corner notifications without blocking navigation. Logging out or switching accounts clears the widget conversation; task changes request a refresh of the corresponding host lists.
