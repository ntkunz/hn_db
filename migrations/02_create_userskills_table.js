exports.up = function (knex) {
	return knex.schema.createTable("userskills", (table) => {
		table.increments("id").primary();
		table.uuid("user_id").notNullable();
		table.string("skill").notNullable();
		table.boolean("offer").notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("userskills");
};
