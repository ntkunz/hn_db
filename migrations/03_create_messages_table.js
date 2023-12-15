exports.up = function (knex) {
	return knex.schema.createTable("messages", (table) => {
		table.increments("id").primary();
		table.uuid("sender_id").notNullable();
		table.uuid("receiver_id").notNullable();
		//enum for received and read values for receiver
		table.string("message", 3000).notNullable();
		table.integer("unix_timestamp").notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("messages");
};
