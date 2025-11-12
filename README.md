💬 Chat App — React Native + Node.js + Socket.IO

A real-time 1:1 chat application built with React Native (frontend) and Node.js (Express + Socket.IO) backend, powered by MongoDB for persistent storage.

🚀 Features

✅ JWT Authentication (Register/Login)
✅ Real-time messaging using Socket.IO
✅ Message persistence in MongoDB
✅ Typing indicators
✅ Online/Offline user status
✅ Message delivery + read receipts (✅ / ✅✅)
✅ Simple & responsive chat UI
✅ User list + last message preview

🏗️ Project Structure
chat-app/
│
├── mobile/            # React Native Frontend
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── ChatListScreen.js
│   │   │   └── ChatScreen.js
│   │   └── utils/
│   │       └── api.js
│   ├── App.js
│   └── package.json
│
├── server/            # Node.js Backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   └── auth.js
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── README.md

⚙️ Tech Stack

Frontend

React Native

Expo

Axios

Socket.IO Client

Backend

Node.js + Express

Socket.IO

MongoDB + Mongoose

JWT (jsonwebtoken)

bcryptjs

🔑 API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Login and receive JWT token
User Routes
Method	Endpoint	Description
GET	/users	Fetch all registered users
Conversation Routes
Method	Endpoint	Description
GET	/conversations?user1=:id1&user2=:id2	Get or create a conversation
GET	/conversations/:id/messages	Get all messages in a conversation
GET	/conversations/user/:userId	Fetch all user’s conversations
⚡ Socket Events
Event	Direction	Description
user:join	Client → Server	Notify server user joined
user:online	Server → All	Broadcast online users list
message:send	Client → Server	Send a new message
message:new	Server → Client	Receive a new message
message:update	Server → Client	Update message delivery/read status
message:read	Client → Server	Mark messages as read
typing:start	Client → Server	Notify receiver that sender is typing
typing:stop	Client → Server	Notify receiver typing stopped
typing:update	Server → Client	Update typing state on receiver side
⚙️ Setup & Installation
1️⃣ Clone Repository
git clone https://github.com/Kiranpjk/Chat-App.git
cd chat-app

2️⃣ Backend Setup
cd server
npm install


Create .env file

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/chatdb
JWT_SECRET=supersecretkey


Seed Sample Users

node scripts/seed.js


Run Server

npm run dev


✅ Server runs at http://0.0.0.0:4000

3️⃣ Frontend Setup
cd ../mobile
npm install


Update your IP address inside code:

// src/utils/api.js or ChatScreen.js
export const SERVER_URL = "http://YOUR_LOCAL_IP:4000";


💡 Run this in terminal to find your IP:

ipconfig


Use your IPv4 Address (e.g., 192.168.x.x).

Start the app

npx expo start --tunnel


Scan the QR code using Expo Go.

🧪 Sample Test Users
Name	Email	Password
Alice	alice@test.com
123456
Bob	bob@test.com
123456
🧠 How to Use

1️⃣ Register or login as two different users (Alice & Bob).
2️⃣ On the home screen, tap a user to start chat.
3️⃣ Type messages → real-time updates show instantly.
4️⃣ Watch typing indicators 💬 and online status 🟢/🔴.
5️⃣ See message ticks:

🕓 = Sent

✅ = Delivered

✅✅ = Read



🧰 Scripts
Command	Description
npm run dev	Run backend in dev mode
npm start	Run frontend (Expo)
node scripts/seed.js	Add demo users
🛡️ Environment Variables
Key	Description	Example
PORT	Server Port	4000
MONGO_URI	MongoDB URI	mongodb://127.0.0.1:27017/chatdb
JWT_SECRET	JWT signing key	mysupersecret


