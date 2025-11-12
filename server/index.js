require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const app = express();
app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB error:", err));
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/conversations", async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2)
    return res.status(400).json({ error: "user1 and user2 required" });

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });
    if (!conversation)
      conversation = await Conversation.create({
        participants: [user1, user2],
      });

    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/conversations/:id/messages", async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/conversations/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name _id")
      .sort({ updatedAt: -1 });

    const result = [];
    for (const convo of conversations) {
      const lastMsg = await Message.findOne({ conversation: convo._id })
        .sort({ createdAt: -1 })
        .lean();

      if (!lastMsg) continue;

      const other = convo.participants.find(
        (p) => p._id.toString() !== userId
      );

      result.push({
        _id: convo._id,
        user: other,
        lastMessage: lastMsg.text,
        lastTime: lastMsg.createdAt,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("user:join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("user:online", Array.from(onlineUsers.keys()));
    console.log(`🟢 User ${userId} online`);
  });
  socket.on("message:send", async (data) => {
    try {
      const { from, to, text } = data;
      if (!from || !to) {
        console.warn("❌ Missing sender or receiver ID", data);
        return;
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [from, to] },
      });

      if (!conversation) {
        conversation = await Conversation.create({ participants: [from, to] });
      }

      const message = await Message.create({
        conversation: conversation._id,
        from,
        to,
        text,
        status: "sent",
      });

      const receiverSocket = onlineUsers.get(to);

      if (receiverSocket) {
        io.to(receiverSocket).emit("message:new", message);
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        io.to(socket.id).emit("message:update", {
          _id: message._id,
          status: "delivered",
        });
      }

      io.to(socket.id).emit("message:new", message);
      await Conversation.findByIdAndUpdate(conversation._id, {
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("❌ Message send error:", err);
    }
  });

  // 👁️ Mark as read
  socket.on("message:read", async ({ conversationId, readerId }) => {
    try {
      const unread = await Message.find({
        conversation: conversationId,
        to: readerId,
        status: { $ne: "read" },
      });

      for (const msg of unread) {
        msg.status = "read";
        await msg.save();

        const senderSocket = onlineUsers.get(msg.from.toString());
        if (senderSocket)
          io.to(senderSocket).emit("message:update", {
            _id: msg._id,
            status: "read",
          });
      }
    } catch (err) {
      console.error("❌ Read receipt error:", err);
    }
  });
  socket.on("typing:start", ({ from, to }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket)
      io.to(receiverSocket).emit("typing:update", { from, typing: true });
  });
  socket.on("typing:stop", ({ from, to }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket)
      io.to(receiverSocket).emit("typing:update", { from, typing: false });
  });
  socket.on("disconnect", () => {
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        io.emit("user:online", Array.from(onlineUsers.keys()));
        console.log(`🔴 User ${uid} disconnected`);
        break;
      }
    }
  });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
);
