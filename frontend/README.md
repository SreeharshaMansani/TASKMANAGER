# Task Manager frontend

React frontend for the independent Task Manager application. Run commands from this directory.

## Run and build

```powershell
npm ci
npm start
```

Open http://localhost:3000. Start the Task Manager backend separately from ../backend with npm start (port 5000).

Run npm test -- --watchAll=false --runInBand for the frontend checks and npm run build for a production build. Frontend environment settings are documented in .env.example; restart or rebuild after changing them.

## Optional chatbot widget

The installed @task-assistant/widget package owns the chat UI. src/integrations/TaskAssistant.jsx only supplies the current user session and task refresh callbacks. src/App.js mounts it inside the host router and providers. The widget release is stored in vendor/ so installation does not need a sibling chatbot source directory.

Start the chatbot API separately from C:\Users\Dell\Desktop\chatbot with npm start (port 3001). Set REACT_APP_CHATBOT_URL when using another address. There is no second login or standalone chatbot web page. Task Manager's normal screens work independently of chatbot availability.

The backend verifies the host session and passes the verified name to the model, so a greeting may use your name without a model-selected profile tool call. The tool trace excludes authentication requests. Logout and account changes clear the chat; successful task changes refresh host lists.

Keep private keys and database credentials on the backend. The widget receives a user token, not the application's signing secret. See ../README.md for the complete project setup and package-update instructions.

## Source organization

Route screens live in `src/pages/`; shared UI is in `src/components/`. Task state is in `src/context/`, reusable hooks in `src/hooks/`, and styles in `src/styles/`. Tests stay under `src/__tests__/` for Create React App discovery.
