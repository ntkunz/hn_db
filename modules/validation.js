const yup = require("yup");

const validate = (schema) => async (req, res, next) => {
	try {
		await schema.validate({
			body: req.body,
			query: req.query,
			params: req.params,
		});
		return next();
	} catch (error) {
		return res.status(401).json({ type: error.name, message: error.message });
	}
};

// === I THINK THAT THE COMPILER DOESN'T LIKE THAT THIS ISN'T A CALLBACK FUNCTION, SO CANNOT EXPORT IT AS A MODULE ===
// const loginSchema = yup.object({
// 	body: yup.object({
// 		email: yup.string().required("Email is required").email("Email is invalid"),
// 		password: yup
// 			.string()
// 			.required("Password is required")
// 			.min(8, "Password must be at least 6 characters")
// 			.max(24, "Password must not exceed 24 characters")
// 			.matches(/\d+/, "Password needs a number")
// 			.matches(/[a-z]+/, "Password needs a lowercase letter")
// 			.matches(/[A-Z]+/, "Password needs an uppercase letter")
// 			.matches(/[!@#$%^&*()-+]+/, "Password needs special character"),
// 	}),
// });

module.exports = {
	validate,
	// loginSchema,
};
