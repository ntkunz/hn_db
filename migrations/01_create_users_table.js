exports.up = function (knex) {
	return knex.schema.createTable("users", (table) => {
		table.uuid("user_id").primary().notNullable();
		table.string("first_name").notNullable();
		table.string("last_name").notNullable();
		table.string("email").notNullable();
		table.string("password").notNullable();
		table
			.string("image_url")
			.nullable()
			.defaultTo("hassan-rafhaan--unsplash.jpg");
		table.string("status").notNullable();
		table.string("home").notNullable();
		table.string("city").notNullable();
		table.string("province").notNullable();
		table.string("address").notNullable();
		table.string("about", 240).notNullable();
		table.point("location").notNullable();
		table.timestamps(true, true);
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("users");
};
