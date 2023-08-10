# hn_db

Welcome to the Helping Neighbors Express server.

While this repo is open to the public, the server is set to only respond to requests from the live beta [Helping Neighbors](https://helping-neighbors.nicholaskunz.com) app :couple: :hammer: :dizzy:.

When a user signs up with a unique email address their location (along with all other data) is stored in the helping neighbors MySQL database. Logged in users will be returned all users within a 1/2 kilometer of their address. A logged in user can then message any of their neighbors to enquire about bartering services or goods.

All passwords are hashed and salted, all user input is validated and sanitized, all routes that return data are protected and all calls are rate limited with the help of some great node packages.

There are some more controls and routes I will be adding soon, and there is much refactoring to be done as this is very much a functioning work in progress. Please enjoy the site and if you are inclined to peek around the code, please send me a message with any feedback you have.

See the frontend repository for the site [here](https://github.com/ntkunz/helping_neighbors).

:incoming_envelope: mrnicholaskunz@gmail.com
