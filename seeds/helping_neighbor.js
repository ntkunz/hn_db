const userData = require("../seed_data/users");
const messages = require("../seed_data/messages");
const userskills = require("../seed_data/userskills");

exports.seed = function (knex) {
    return knex("users")
    .del()
    .then(() => {
        return knex("users").insert(userData);
    })
    .then(() => {
        return knex("messages").del();
    })
    .then(() => {
        return knex("messages").insert(messages);
    })
    .then(() => {
        return knex("userskills").del();
    })
    .then(() => {
        return knex("userskills").insert(userskills);
    });
};