# Chat Application

[![React Version](https://img.shields.io/badge/react-19.0.0-%2361DAFB?logo=react)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-6.2.0-%646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.16.0-brightgreen?logo=node.js)](https://nodejs.org/)

Real-time chat application using React 19 and MQTT protocol

## 🛠 Technologies

- **Framework**: [React](https://react.dev/) v19.0.0
- **Build Tool**: [Vite](https://vitejs.dev/) v6.2.0
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) v2.6.1
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4.1.4
- **Runtime**: [Node.js](https://nodejs.org/) v18.16.0+
- **Package Manager**: npm 9.5.0+ / yarn 1.22.19+ / pnpm 7.0.0+

## ⚙️ Prerequisites

- Node.js >= 18.16.0
- npm (comes with Node.js) or yarn/pnpm

## 🚀 Getting Started

1. **Clone repository**

```bash
git clone https://github.com/alxblock-io/adlxblock-chat-fe.git
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Access the application**

Open your browser and navigate to `http://localhost:5173`

## 📂 Project Structure

```bash
src/
├── assets/            # Static assets (images, fonts)
├── components/        # Reusable UI components
│   ├── svgs/          # Svg icons
├── pages/             # Page-level components
│   ├── public/        # Public pages
│   └── private/       # Authenticated routes
│       └── chat-room/ # Main chat interface
├── store/             # Redux store configuration
│   ├── slices/        # Redux slices
│   └── actions/       # Redux actions
│   └── middlewares/   # Redux middlewares
│   └── selectors/     # Redux selectors
│   └── index.js       # Redux store configuration
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
│   ├── helpers/       # Helper functions
│   └── constants.js   # Application constants
├── App.jsx            # Main application component
└── main.jsx           # Application entry point

public/
├── vite.svg           # Vite default asset

configs/
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind CSS config
```
