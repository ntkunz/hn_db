const knex = require("knex")(require("./knexfile"));
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/usersRoute');
const userSkillsRoutes = require('./routes/userSkillsRoute');

app.use('/users', userRoutes);
app.use('/userskills', userSkillsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})