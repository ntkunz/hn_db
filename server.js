const knex = require("knex")(require("./knexfile"));
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
	// windowMs: 15 * 60 * 1000, // 15 minutes
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(cors());
app.use(express.json());
app.use(express.static('public/images'));
app.use(helmet());
app.use(limiter);

const userRoutes = require('./routes/usersRoute');
const userSkillsRoutes = require('./routes/userSkillsRoute');
const messageRoutes = require('./routes/messagesRoute');

app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/userskills', userSkillsRoutes);

app.listen(PORT, () => {
   console.log(`Server is running on port: ${PORT}`);
})