const knex = require("knex")(require("../knexfile"));

module.exports = [
    {
      user_id: "a193a6a7-42ab-4182-97dc-555ee85e7486",
      first_name: "Bart",
      last_name: "Simpson",
      email: "bart@gmail.com",
      password: "1234",
      image_url: "https://www.desicomments.com/wp-content/uploads/2017/02/Bart-simpson-Looking-Superman-600x692.png",
      status: "active",
      home: "455 granville st",
      city: 'vancouver',
      province: 'british columbia',
      address: "455 granville st, vancouver, bc, canada",
      about: "My name is Bart, and I've lived in the neighborhood for all of my life. I like to skateboard and paint graffiti (sorry if I've tagged your place before). Let's connect and wash each others' backs, as the expression goes.",
      location: knex.raw('Point(-123.11466013373249,49.28510303821817)')
    },
    {
      user_id: "h346k6a7-42ab-4182-97dc-555ee85e7486",
      first_name: "Lisa",
      last_name: "Simpson",
      email: "lisa@gmail.com",
      password: "1234",
      image_url: "https://images3.alphacoders.com/256/256995.jpg",
      status: "active",
      home: "440 granville st",
      city: 'vancouver',
      province: 'british columbia',
      address: "440 granville st, vancouver, bc, canada",
      about: "Hi everyone, Lisa here! I love to play my saxophone and get good grades at school, and I'm excited to help out with any needs you may have. I'm also interested in meeting you all and sharing experiences.",
      location: knex.raw('Point(-123.11421962221165,49.28494009469127)')
    },
    {
      user_id: "9b4f79ea-0e6c-4e59-8e05-afd933d0b3d3",
      first_name: "Ned",
      last_name: "Flanders",
      email: "ned@gmail.com",
      password: "1234",
      image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ5RrvXdWEs6J1wECfPUj1JYOktrpQwTwjYw&usqp=CAU",
      status: "active",
      home: "757 w hastings",
      city: 'vancouver',
      province: 'british columbia',
      address: "757 w hastings, vancouver, bc, canada",
      about: "How-didilly-doo neighbors. I look forward to meeting you all and making our blessed neighborhood that much more blessed.",
      location: knex.raw('point(-123.11455548945395,49.285493272008466)')
    },
    {
      user_id: "7j5f79ea-0e6c-4e59-8e05-afd933d0b3d3",
      first_name: "Brendan",
      last_name: "Small",
      email: "homemovies@gmail.com",
      password: "1234",
      image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYVDXNcQI9-mHM-cRBSAqpV1qnhgIjuuhXPA&usqp=CAU",
      status: "active",
      home: "3228 east 23rd",
      city: 'spokane',
      province: 'washington',
      address: "3228 east 23rd, Spokane, Wa, USA, 99223",
      about: "Brendan here. I love making movies and music videos with my friends. If you'd like some video work done, I'm your guy. I'd love to get access to some new shooting locations around the neighborhood if you have any. Thanks.",
      location: knex.raw('point(-117.36181915092484,47.633491232890755)')
    },
  ];
  