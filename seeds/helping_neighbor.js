const userData = require("../seed_data/users");
const messages = require("../seed_data/messages");
const skills = require("../seed_data/skills");
const userSkills = require("../seed_data/userSkills");

exports.seed = function (knex) {
    return knex("users")
    .del()
    .then(() => {
        return knex("users").insert(userData);
    });
    // .then(() => {
    //     return knex("messages").del();
    // })
    // .then(() => {
    //     return knex("messages").insert(messages);
    // })
    // .then(() => {
    //     return knex("skills").del();
    // })
    // .then(() => {
    //     return knex("skills").insert(skills);
    // })
    // .then(() => {
    //     return knex("userSkills").del();
    // })
    // .then(() => {
    //     return knex("userSkills").insert(userSkills);
    // });
};