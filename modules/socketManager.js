const knex = require("knex")(require("../knexfile"));

const handleSocketConnections = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // receive new message, insert data into database, respond with updated conversation
    socket.on("sendMessageToApi", (messageData) => {
      // TODO: move place message function to external file
      knex("messages")
        .insert({
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          message: messageData.message,
          unix_timestamp: Math.floor(Date.now() / 1000),
        })
        .then(() => {
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

    // join a message room/page and emit conversation
    socket.on("joinRoom", (senderId, receiverId) => {
      // TODO: move getConversation function to external file
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
};

module.exports = handleSocketConnections;
