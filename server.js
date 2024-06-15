const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const knex = require("knex")(require("./knexfile"));
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const jwt = require("jsonwebtoken");
const geoApiUrl = process.env.REACT_APP_GEO_URL;
const geoApiKey = process.env.REACT_APP_GEO_API_KEY;

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

// TODO : Relocate getNeighbors function to utils
async function getNeighbors(userId) {
  const user = await knex("users")
    .join("userskills", "users.user_id", "userskills.user_id")
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

  const sortedNeighbors = neighbors.sort((a, b) => {
    if (a.userId === user.user_id) {
      return -1;
    } else {
      return 0;
    }
  });

  return sortedNeighbors;
}

app.get("/getUserInfo", async (req, res) => {
  try {
    // TODO : Extract verifyUser to a function, next 8 lines.
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
    return res.send(XXXuserDataXXX).status(200);
  } catch (error) {
    console.log("error: ", error);
    return res.sendStatus(401);
  }
});

// TODO : Separate below out into 2 functions, one to create the address
//    and snother to make the fetch request

function createAddress(homeAddress, city, province) {
  const address = `${homeAddress} ${city} ${province}`;
  return address;
}

async function getUserLatLong(address) {
  const addressRequest = address
    .replaceAll(",", " ")
    .replaceAll(" ", "+")
    .replaceAll(".", "+");
  console.log("addressRequest: ", addressRequest);

  const userGeocache = await fetch(
    `${geoApiUrl}?q=${addressRequest}&apiKey=${geoApiKey}`
  );

  const userGeocacheJson = await userGeocache.json();
  console.log("userGeocacheJson: ", userGeocacheJson);
  console.log(
    "userGeocacheJson.items[0].position: ",
    userGeocacheJson.items[0].position
  );
  // console.log("userGeocache: ", userGeocache);
  const userLatLong = [
    userGeocacheJson.items[0].position.lng,
    userGeocacheJson.items[0].position.lat,
  ];
  return userLatLong;
}

app.post("/create-account", async (req, res) => {
  // TODO : Extract verifyUser to a function, next 8 lines.
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
      return res.sendStatus(401).send("Unauthorized");
    }

    const address = createAddress(
      req.body.homeAddress,
      req.body.city,
      req.body.province
    );

    // TODO : Go get lat long for user
    const userLatLong = await getUserLatLong(address);

    console.log("userLatLong: ", userLatLong);

    // TODO : add error handling if userLatLong returns an error

    // NOTE !!!!!!!!!!!!! Somethins is broken with my lat long since I changed from .x and .y object to separate lat long below
    // this happened on June 9th 2024

    // req.body.location = {
    //   x: userLatLong[0],
    //   y: userLatLong[1],
    // };

    req.body.status = "active";
    // TODO : figure out joining tables and adding userskills as barters and skills...

    const newUserData = {
      user_id: req.body.userId,
      about: req.body.about,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      location: knex.raw("POINT(?, ?)", [userLatLong[0], userLatLong[1]]),
      image_url: req.body.image_url,
      status: req.body.status,
      home: req.body.homeAddress,
      city: req.body.city,
      province: req.body.province,
      address: address,
    };

    await knex("users").insert(newUserData);

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

function sortRooms(id, userId) {
  const sortedStrings = [id, userId].sort();
  return sortedStrings.join("");
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);

  // Socket connection
  io.on("connection", (socket) => {
    console.log("A user connected");
    // TODO : Go get most recent socket even compared to last seen date from user's profile (need to pass that in)
    // and notify if any new messages

    socket.on("joinRoom", (senderId, receiverId) => {
      const roomId = sortRooms(senderId, receiverId);
      socket.join(roomId);
      console.log("User joined room: ", roomId);

      // TODO : Create a room id and transmit it back to the users when they join that conversation... or add it to all messages?
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

    // Handle socket events
    socket.on("sendMessageToApi", (messageData) => {
      const roomId = sortRooms(messageData.senderId, messageData.receiverId);
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
            // socket.in(roomId).emit("conversation", messages);
            io.in(roomId).emit("conversation", messages);
          });
        })
        .catch((error) => {
          console.log("Error in sendMessageToApi:", error);
        });
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
});

//     socket.on(
// });

// Suggestion from Codeium for creating a roomId... maybe do that by sorting the id's first?

// socket.on("joinRoom", (senderId, receiverId) => {
//   // Generate a unique room ID. This could be a combination of senderId and receiverId or a separate conversation ID from your database.
//   const roomId = `${senderId}-${receiverId}`;

//   // Join the room
//   socket.join(roomId);

//   // Fetch and emit previous conversation messages to the room
//   const getConversation = knex("messages")
//     .where({ sender_id: senderId, receiver_id: receiverId })
//     .orWhere({ receiver_id: senderId, sender_id: receiverId });
//   getConversation
//     .then((messages) => {
//       io.to(roomId).emit("conversation", messages); // Emit to all users in the room
//     })
//     .catch((error) => {
//       console.log("Error in joinRoom:", error);
//     });
// });

// socket.on("sendMessageToApi", (messageData) => {
//   // Add message data to database
//   knex("messages")
//     .insert({
//       sender_id: messageData.senderId,
//       receiver_id: messageData.receiverId,
//       message: messageData.message,
//       unix_timestamp: Math.floor(Date.now() / 1000),
//     })
//     .then(() => {
//       // Respond with all messages
//       const getConversation = knex("messages")
//         .where({
//           sender_id: messageData.senderId,
//           receiver_id: messageData.receiverId,
//         })
//         .orWhere({
//           receiver_id: messageData.senderId,
//           sender_id: messageData.receiverId,
//         });
//       getConversation.then((messages) => {
//         const roomId = `${messageData.senderId}-${messageData.receiverId}`;
//         io.to(roomId).emit("conversation", messages); // Emit to all users in the room
//       });
//     })
//     .catch((error) => {
//       console.log("Error in sendMessageToApi:", error);
//     });
// });
