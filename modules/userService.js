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
			.where(whereClause);



			// Exclude password from the user object
		if (user[0]) {
			const userskills = await knex("userskills")
			.select("skill", "offer")
			.where("user_id", user[0].user_id);

			user[0].barters = userskills;

		const { password, ...userWithoutPassword } = user[0];
		return { user: userWithoutPassword, password: password };
		} else {
			return null;
		}

	} catch (err) {
		// throw new Error(`Error retrieving edited user: ${err}`);
		return null;
		
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
