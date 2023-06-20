//require knex and the knex configuration files
const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig);

const { whereClause, joinClause, userData } = require("./userQueries");

// Helper function to update user information
async function updateUser(whereClause, userData) {
	try {
		await knex("users").where(whereClause).first().update(userData);
	} catch (err) {
		throw new Error(`Error updating user: ${err}`);
	}
}

// Helper function to retrieve edited user information
async function getUser(whereClause, joinClause) {
	try {
		const user = await knex("users")
			.join(joinClause.table, joinClause.joinCondition)
			.select(
				"users.user_id",
				"users.about",
				"users.email",
				"users.first_name",
				"users.last_name",
				"users.location",
				"users.image_url",
				"users.status",
				"users.password",
				"users.home",
				"users.city",
				"users.province",
				"users.address",
				"users.created_at"
			)
			.select(
				knex.raw(
					"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
				)
			)
			.groupBy("users.user_id")
			.where(whereClause)
			.first();

			// Exclude password from the user object
		const { password, ...userWithoutPassword } = user;
		return { user: userWithoutPassword, password: password };
		// return { user: userWithoutPassword, password: user.password };

	} catch (err) {
		throw new Error(`Error retrieving edited user: ${err}`);
	}
}

async function getUserPassword(whereClause) {
	try {
		const user = await knex("users")
			.select("password", "user_id")
			.where(whereClause)
			.first();
		return user;
	} catch (err) {
		throw new Error(`Error retrieving edited user: ${err}`);
	}
}

module.exports = {
	updateUser,
	getUser,
	whereClause,
	joinClause,
	userData,
	getUserPassword,
};
