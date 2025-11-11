// server/scripts/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// ensure paths work from server root
const User = require(path.join(__dirname, "..", "models", "User"));
const Conversation = require(path.join(__dirname, "..", "models", "Conversation"));
const Message = require(path.join(__dirname, "..", "models", "Message"));

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-app";

async function seed() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB:", MONGO);

    // wipe (optional)
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await User.deleteMany({});

    // create users
    const pw = await bcrypt.hash("pass1234", 10);
    const alice = await User.create({ name: "Alice", email: "alice@test.com", password: pw });
    const bob = await User.create({ name: "Bob", email: "bob@test.com", password: pw });
    const test = await User.create({ name: "Test User", email: "test1@example.com", password: pw });

    console.log("Users created:", [alice._id.toString(), bob._id.toString(), test._id.toString()]);

    // create conversation Alice <-> Bob
    const convoAB = await Conversation.create({ participants: [alice._id, bob._id] });
    // create a message from Alice -> Bob
    await Message.create({
      conversation: convoAB._id,
      from: alice._id,
      to: bob._id,
      text: "Hello Bob! This is Alice (seed).",
      status: "delivered",
    });

    // create conversation Bob <-> Test User
    const convoBT = await Conversation.create({ participants: [bob._id, test._id] });
    await Message.create({
      conversation: convoBT._id,
      from: test._id,
      to: bob._id,
      text: "Hey Bob, test message from Test User.",
      status: "sent",
    });

    console.log("Seed finished.");
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
