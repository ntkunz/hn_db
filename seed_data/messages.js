const knex = require("knex")(require("../knexfile"));

module.exports = [
    {
        sender_id: "a193a6a7-42ab-4182-97dc-555ee85e7486",
        receiver_id: "h346k6a7-42ab-4182-97dc-555ee85e7486",
        message: "test message 1",
        unix_timestamp: Math.floor(Date.now() / 1000),
    },
    {
        sender_id: "h346k6a7-42ab-4182-97dc-555ee85e7486",
        receiver_id: "a193a6a7-42ab-4182-97dc-555ee85e7486",
        message: "test message 2",
        unix_timestamp: Math.floor(Date.now() / 1000),
    }
  ];
  