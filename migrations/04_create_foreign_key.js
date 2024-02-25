// exports.up = function (knex) {
//   return knex.schema
//     .alterTable("userskills", (table) => {
//       table.index("user_id"); // Adding an index for the user_id column
//       table.foreign("user_id").references("users.user_id");
//     })
//     .alterTable("users", (table) => {
//       // table.primary("user_id").references("userskills.user_id");
//       table.uuid("user_id").references("users.user_id");
//     });
// };

// exports.down = function (knex) {
//   return knex.schema
//     .alterTable("userskills", (table) => {
//       table.dropForeign("user_id");
//       table.dropIndex("user_id"); // Dropping the index for the user_id column
//     })
//     .alterTable("users", (table) => {
//       table.dropForeign("user_id");
//     });
// };

exports.up = function (knex) {
  return knex.schema.alterTable("userskills", (table) => {
    table.foreign("user_id").references("users.user_id"); // Define the foreign key relationship
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("userskills", (table) => {
    table.dropForeign("user_id"); // Drop the foreign key relationship
  });
};
