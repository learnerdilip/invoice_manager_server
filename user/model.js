const Sequelize = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("user", {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING
  },
  country: {
    type: Sequelize.STRING
  },
  phone: {
    type: Sequelize.INTEGER
  }
});

module.exports = User;