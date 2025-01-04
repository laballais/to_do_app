# To Do App: a simple To Do application to manage your to do lists using React + Vite

![alt text](Homepage.png)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Read below for deployment
"npx vite" and "node server.js" must be run concurrently for this project.
"node server.js" initiates the server for the database (back-end) while "npx vite" initiates server for the the front-end.
To do so, I have added a script on package.json "start-dev" that runs "npx vite" and "node server.js" concurrently.
Use the command in terminal:

npm run start-dev

