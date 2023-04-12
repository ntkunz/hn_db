const knex = require("knex")(require("./knexfile"));
const express = require('express');
const cors = require('cors');
const app = express();
// const multer  = require('multer')
const PORT = process.env.PORT || 8080


// // setup multer for file upload
// const storage = multer.diskStorage(
//     {
//         destination: './build',
//         filename: function (req, file, cb ) {
//             cb( null, file.originalname);
//         }
//     }
// );
// const upload = multer({ storage: storage } )

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/usersRoute');
const userSkillsRoutes = require('./routes/userSkillsRoute');
const messageRoutes = require('./routes/messagesRoute');
const imageRoutes = require('./routes/imageRoute');


app.use('/image', imageRoutes)
app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/userskills', userSkillsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})