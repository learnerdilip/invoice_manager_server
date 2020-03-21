const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("../user/model");

const Room = sequelize.define("room", {
  room_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  roomimage: {
    type: Sequelize.STRING
  }
});

User.hasMany(Room);
Room.belongsTo(User);

module.exports = Room;
