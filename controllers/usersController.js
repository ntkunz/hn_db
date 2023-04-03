const knex = require("knex")(require("../knexfile"));

//get all users	
exports.index = (_req, res) => {
	knex("users")
		.then((data) => {
			res.status(200).json(data);
			console.log('users retrieved successfully: ', data)
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};

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