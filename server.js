const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const knex = require("knex")(require("./knexfile"));
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const jwt = require("jsonwebtoken");

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const { protect } = require("./modules/auth");
const { protectV2 } = require("./modules/auth");

const corsOptions = {
  // TODO : Add test environment to origin
  origin: allowedOrigins,
};

// TODO : Move rateLimit variables to utils file
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.static("public/images"));
app.use(helmet());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const userRoutes = require("./routes/usersRoute");
const userSkillsRoutes = require("./routes/userSkillsRoute");
const messageRoutes = require("./routes/messagesRoute");

// IN PROGRESS : v2 routes for routes and controllers refactor
const userRoutesV2 = require("./routes/userRoutesV2");
// const authRoutesV2 = require("./routes/authRoutesV2");

async function getNeighbors(userId) {
  const user = await knex("users")
    .join("userskills", "users.user_id", "userskills.user_id")
    // .select("users.*")
    .select(
      { userId: "users.user_id" },
      { about: "users.about" },
      { firstName: "users.first_name" },
      { lastName: "users.last_name" },
      { location: "users.location" },
      { imageUrl: "users.image_url" },
      { status: "users.status" },
      { createdAt: "users.created_at" }
    )
    .select(
      knex.raw("JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters")
    )
    .groupBy("users.user_id")
    .where("users.user_id", userId)
    .first();

  // console.log("user: ", user);
  const neighbors = await knex("users")
    .join("userskills", "users.user_id", "userskills.user_id")
    .select(
      { userId: "users.user_id" },
      { about: "users.about" },
      { firstName: "users.first_name" },
      { imageUrl: "users.image_url" },
      { status: "users.status" },
      { createdAt: "users.created_at" }
    )
    .select(
      knex.raw("JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters")
    )
    .whereRaw(
      "st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
        user.location.x +
        " " +
        user.location.y +
        ")', 0)) < 500"
    )
    .groupBy("users.user_id");

  // console.log("neighbors: ", neighbors);

  const sortedNeighbors = neighbors.sort((a, b) => {
    if (a.userId === user.user_id) {
      return -1; // a comes before b
    } else {
      return 0; // maintain the original order
    }
  });

  // console.log("sortedNeighbors: ", sortedNeighbors);

  return sortedNeighbors;
}

// add response to handle when a get request call is made to the /test route
app.get("/getuserInfo", async (req, res) => {
  try {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    const verifiedPayload = jwt.verify(
      accessToken,
      process.env.USERFRONT_JWT_PUBLIC_KEY,
      {
        algorithm: ["RS256"],
      }
    );
    if (!verifiedPayload) {
      return res.sendStatus(401);
    }

    const userId = verifiedPayload.userUuid;
    const XXXuserDataXXX = await getNeighbors(userId);

    console.log("XXXuserDataXXX: ", XXXuserDataXXX);
    return res.send(XXXuserDataXXX).status(200);
  } catch (error) {
    console.log("error: ", error);
    return res.sendStatus(401);
  }
});

app.post("/create-account", (req, res) => {
  try {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    const verifiedPayload = jwt.verify(
      accessToken,
      process.env.USERFRONT_JWT_PUBLIC_KEY,
      {
        algorithm: ["RS256"],
      }
    );
    if (!verifiedPayload) {
      return res.sendStatus(401);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log("error: ", error);
    return res.sendStatus(401);
  }
});

// app.post("/", (req, res) => {
//   console.log("req.body: ", req.body);
//   const accessToken = req.headers.authorization.replace("Bearer ", "");
//   //   console.log("req.headers.authorization: ", req.headers.authorization);
//   const verifiedPayload = jwt.verify(
//     accessToken,
//     process.env.USERFRONT_JWT_PUBLIC_KEY,
//     {
//       algorithm: ["RS256"],
//     }
//   );
//   res.sendStatus(200).send(verifiedPayload);
// });

app.use("/messages", protect, messageRoutes);
app.use("/users", protect, userRoutes);
app.use("/userskills", protect, userSkillsRoutes);
// app.use("v2/user", protect, userRoutesV2);
app.use("/v2/user", userRoutesV2);
// app.use("/v2/auth", protectV2, authRoutesV2);

app.get("*", (_req, res) => {
  // catchall to catch any undefined routes, but not serving serverside html so blank for now
  // res.sendFile("index.html", { root: __dirname + "./../build" });
});

// TODO: Add error handling responses to update frontend on message error
// TODO: Extract "getConversation" to utils file
// TODO: Move socket events to messagesController
// TODO: Add socket events for logging in/returning neighbors, creating user, deleting user, etc

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);

  // Socket connection
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle socket events
    socket.on("sendMessageToApi", (messageData) => {
      //add message data to database
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
        .where({ sender_id: senderId, receiver_id: receiverId })
        .orWhere({ receiver_id: senderId, sender_id: receiverId });
      getConversation
        .then((messages) => {
          socket.emit("conversation", messages);
        })
        .catch((error) => {
          console.log("Error in joinRoom:", error);
        });
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
});
