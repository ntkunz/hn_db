import { object, string } from "yup";

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

const loginSchema = object({
	body: object({
		email: string().required("Email is required").email("Email is invalid"),
		password: string()
			.required("Password is required")
			.min(8, "Password must be at least 6 characters")
			.max(24, "Password must not exceed 24 characters")
			.matches(/\d+/, "Password needs a number")
			.matches(/[a-z]+/, "Password needs a lowercase letter")
			.matches(/[A-Z]+/, "Password needs an uppercase letter")
			.matches(/[!@#$%^&*()-+]+/, "Password needs special character"),
	}),
});

export default {
	validate,
	loginSchema,
};
