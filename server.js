const knex = require("knex")(require("./knexfile"));
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json());
app.use(express.static('public/images'));

const userRoutes = require('./routes/usersRoute');
const userSkillsRoutes = require('./routes/userSkillsRoute');
const messageRoutes = require('./routes/messagesRoute');

app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/userskills', userSkillsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})