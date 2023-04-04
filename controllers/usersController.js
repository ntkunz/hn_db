const knex = require("knex")(require("../knexfile"));

//get all users	
exports.index = (_req, res) => {
	knex("users")
		.then((data) => {
			res.status(200).json(data);
			// console.log('users retrieved successfully: ', data)
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};

// exports.getSingleUserzzzzzzzzzzzzzzzz = (req, res) => {
// 	knex("users")
// 		// .join("users", "users.id", "=", "userskills.user_id")
// 		.join(`userskills`, `users.id`, "=", `userskills.user_id`)
// 		.select("users.*", "userskills.skill", "userskills.offer")
// 		// select `users`.*, `userskills`.`skill`, `userskills`.`offer` from `users` inner join `userskills` on `users`.`id` = `userskills`.`user_id` where `users`.`id` = '9b4f79ea-0e6c-4e59-8e05-afd933d0b3d3'
// 		.where(`users.id`, "=", '9b4f79ea-0e6c-4e59-8e05-afd933d0b3d3')
// 		// .where("users.id", req.params.id)
// 			.then((data) => {
// 				if (!data.length) {
// 					return res
// 					.status(404)
// 					.send(`Item with id: ${req.params.id} can't be found`);
// 				}
// 				res.status(200).json(data[0]);
// 			})
// 		.catch((err) => {
// 			res.status(400).send(`Error finding item ${req.params.id} ${err}`);
// 		});
// };
exports.getUserSkills = async (req, res) => {
	try {
	  const userSkills = await knex('users')
	  .innerJoin('userskills', 'users.user_id', '=', 'userskills.user_id')
		.select('userskills.skill', 'userskills.offer')
		.where('users.user_id', req.params.id);
	  res.json(userSkills);
	} catch (err) {
	  console.error(err);
	  res.status(400).send(`Error finding item ${req.params.id} ${err}`);
	}
  };

  exports.getInventoryItem = (req, res) => {
	knex("inventories")
	  .join("warehouses", "inventories.warehouse_id", "=", "warehouses.id")
	  .select("inventories.*", "warehouses.warehouse_name")
	  .where("inventories.id", req.params.id)
	
	
	}


//==============================================================
//how to retrieve lat and long locations from mysql with knex
// SELECT ST_Distance_Sphere(point1, point2) as distance
// FROM (
//   SELECT ST_GeomFromText('POINT(longitude1 latitude1)') as point1,
//          ST_GeomFromText('POINT(longitude2 latitude2)') as point2
// ) as points;
//==============================================================


// SELECT *,
//        ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 AS `Distance in miles from Big Ben`
// FROM places
// WHERE  ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 < 10
// ORDER BY `Distance in miles from Big Ben`;