const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const knex = require("knex")(require("./knexfile"));
require("dotenv").config();
const { protect } = require("./modules/auth");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(","),
    credentials: true,
  },
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(express.static("public/images"));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/usersRoute");
const userSkillsRoutes = require("./routes/userSkillsRoute");
const messageRoutes = require("./routes/messagesRoute");
const authRoutesV2 = require("./routes/authRoutesV2");

app.use("/messages", protect, messageRoutes);
app.use("/users", protect, userRoutes);
app.use("/userskills", protect, userSkillsRoutes);
app.use("/v2/auth", authRoutesV2);

app.get("*", (_req, res) => {
  // catchall to catch any undefined routes, but not serving serverside html so blank for now
  // res.sendFile("index.html", { root: __dirname + "./../build" });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessageToApi", (messageData) => {
    // add message data to database
    knex("messages")
      .insert({
        sender_id: messageData.senderId,
        receiver_id: messageData.receiverId,
        message: messageData.message,
        unix_timestamp: Math.floor(Date.now() / 1000),
      })
      .then(() => {
        // then respond with all messages
        const getConversation = knex("messages")
          .where({
            sender_id: messageData.senderId,
            receiver_id: messageData.receiverId,
          })
          .orWhere({
            receiver_id: messageData.senderId,
            sender_id: messageData.receiverId,
          });

        getConversation.then((messages) => {
          socket.emit("conversation", messages);
        });
      })
      .catch((error) => {
        console.log("Error in sendMessageToApi:", error);
      });
  });

  socket.on("joinRoom", (senderId, receiverId) => {
    const getConversation = knex("messages")
      .where({
        sender_id: senderId,
        receiver_id: receiverId,
      })
      .orWhere({
        receiver_id: senderId,
        sender_id: receiverId,
      });

    getConversation
      .then((messages) => {
        socket.emit("conversation", messages);
      })
      .catch((error) => {
        console.log("Error in joinRoom:", error);
      });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});