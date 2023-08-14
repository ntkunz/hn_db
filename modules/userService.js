const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig);

const { whereClause, joinClause, userData } = require("./userQueries");

async function updateUser(whereClause, userData) {
	try {
		await knex("users").where(whereClause).first().update(userData);
	} catch (err) {
		// throw new Error(`Error updating user: ${err}`);
		console.log("error updating user", err);
	}
}

// Helper function to retrieve new or edited logged in user information
async function getUser(email, joinClause) {
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
			// .where(where);
			.where("users.email", email);
		console.log("user: ", user);
		// Retrieve userskills as 'barters' select above is no longer functioning as expected
		//TODO: Fix userskills join above to not make another call below
		if (user[0]) {
			const userskills = await knex("userskills")
				.select("skill", "offer")
				.where("user_id", user[0].user_id);

			user[0].barters = userskills;
			console.log("user[0]: ", user[0]);
			const { password, ...userWithoutPassword } = user[0];
			return { user: userWithoutPassword, password: password };
		} else {
			return null;
		}
	} catch (err) {
		return "ut oh login error!";
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
