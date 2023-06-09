const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig);

const whereClause = (userEmail) => ({ "users.email": userEmail });

const joinClause = {
	table: "userskills",
	joinCondition: function () {
		this.on("users.user_id", "=", "userskills.user_id");
	},
};

const userData = (req) => {
	return {
		user_id: req.body.user_id,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
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
