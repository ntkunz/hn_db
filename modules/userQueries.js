const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig);

// ===========V2 QUERIES===========

// =============V1 QUERIES============
const whereClause = (userEmail) => ({ "users.email": userEmail });

const joinClause = {
	table: "userskills",
	joinCondition: function () {
		this.on("users.user_id", "=", "userskills.user_id");
	},
};

const userData = (req) => {
	return {
		user_id: req.body.userId,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.firstName,
		last_name: req.body.lastName,
		location: knex.raw("POINT(?, ?)", [req.body.coords[0], req.body.coords[1]]),
		image_url: req.body.image_url,
		status: req.body.status,
		home: req.body.home,
		city: req.body.city,
		province: req.body.province,
		address: req.body.address,
	};
};

module.exports = {
	whereClause,
	joinClause,
	userData,
};
