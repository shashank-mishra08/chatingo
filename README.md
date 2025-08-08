
# MERN-Chat

A real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and WebSockets.

## Features

* User registration and login
* Real-time messaging with WebSockets
* Online/offline status indicators
* File sharing (images and other file types)
* Light/dark theme
* Responsive design

## Tech Stack

**Client:**

* React.js
* Tailwind CSS
* Axios
* Vite

**Server:**

* Node.js
* Express.js
* MongoDB
* Mongoose
* WebSockets (ws)
* JSON Web Tokens (JWT) for authentication
* Bcrypt.js for password hashing

## Project Structure

```
mern-chat-master/
├── api/
│   ├── index.js
│   ├── models/
│   │   ├── Message.js
│   │   └── User.js
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── Avatar.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Contact.jsx
    │   │   ├── Logo.jsx
    │   │   └── RegisterAndLoginForm.jsx
    │   ├── context/
    │   │   ├── ThemeContext.jsx
    │   │   └── UserContext.jsx
    │   └── Routes.jsx
    └── package.json
```

## Getting Started

### Prerequisites

* Node.js and npm (or yarn) installed
* MongoDB installed and running

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/mern-chat.git
   cd mern-chat
   ```

2. **Install server dependencies:**

   ```bash
   cd api
   npm install
   # or
   yarn install
   ```

3. **Install client dependencies:**

   ```bash
   cd ../client
   npm install
   # or
   yarn install
   ```

4. **Create a `.env` file in the `api` directory** and add the following environment variables:

   ```
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

You can run the client and server concurrently from the root directory:

```bash
npm run dev
# or
yarn dev
```

This will start the server on `http://localhost:4040` and the client on `http://localhost:5173`.

## API Endpoints

*   `POST /register`: Register a new user.
*   `POST /login`: Log in an existing user.
*   `POST /logout`: Log out the current user.
*   `GET /profile`: Get the profile of the currently logged-in user.
*   `GET /people`: Get a list of all registered users.
*   `GET /messages/:userId`: Get the chat history with a specific user.

## WebSocket Events

The WebSocket server listens for the following events:

*   **connection**: When a new client connects.
*   **message**: When a client sends a message. The message can be a text message or a file.
*   **close**: When a client disconnects.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
