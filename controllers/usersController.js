const knex = require("knex")(require("../knexfile"));

// //get all users	
// exports.index = (_req, res) => {
// 	knex("users")
// 		.then((data) => {
// 			res.status(200).json(data);
// 			// console.log('users retrieved successfully: ', data)
// 		})
// 		.catch((err) =>
// 			res.status(400).send(`Error retrieving users: ${err}`)
// 		);
// };

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



// exports.getNeighbors = async (req, res) => {
// 	try {
// 		const neighbors = await knex('users')
// 		.select('users.*')
// 		// .where(ST_Distance_sphere(users.location, GOTTA MAKE A VARIABLE HERE BASED ON MY USER! , 2000000);)
// 		// .where(knex.raw(                
// 		// 	round(st_distance_sphere(
// 		// 		st_geomfromtext(CONCAT('POINT(',location,')'))
// 		// 	)) <= 5000
// 		// ), req.params.id);
// 		//=======================
// 		// 'users.location','ST_DWithin(users.location, ST_MakePoint(-122.079513,45.607703), 1000)'
// //==================

// }
// const result = await knex('events')
//     .join('locations', 'events.Location', 'locations.id')
//     .where(knex.raw(                
//         `round(st_distance_sphere(
//             st_geomfromtext(CONCAT('POINT(',locations.Longitude, ' ',locations.Latitude,')')),
//             st_geomfromtext(CONCAT('POINT(` + ctx.query.Longitude + ` ` + ctx.query.Latitude + `)'))
//         )) <= 5000`
//     ))
//     return result
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