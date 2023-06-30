# hn_db

Welcome to the Helping Neighbors express server.

This server, once deployed, will only respond to requests from the Helping Neighbors app. To run locally, feel free to follow the instructions at the app's front-end repo at <a href="https://github.com/ntkunz/helping_neighbors">Helping Neighbors</a>. 

When a user signs up the email is first checked with a **post** to **/users/newemail**, their address is geocoded, then the new profile is saved through a **post** to **/users**

After signing up or logging in (where user is verified), user is returned a token and user object. That token is used in a **.get** request to **/users** to return all users in the database who are within 1/2 kilometer of the user. 

Users can message their neighbors, all previous messages with another user are returned whenever the logged in user selects a neighbor's card, which triggers a **.put** request to **/messages** with the user and neighbor's ids. 

Each new message is added to the database through a **post** request to **/messages** with each user's id and the message. 

Users can edit their profile information with a **put** request to **/users** with their updated profile information in the body.

Users can delete their account with a **delete** request to **/users** along with their token and password.

Images are uploaded using Multer. Rate limiting done with Express Rate Limit, encryption done with Bcrypt, and routes protected using Cors. 

Deployment coming soon. 
