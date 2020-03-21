const Sequelize = require("sequelize");
const sequelize = require("../db");

const MailingList = sequelize.define("mail", {
  email_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mail_priority: {
    type: Sequelize.INTEGER,
    defaultValue: "30"
  },
  product_id: {
    type: Sequelize.INTEGER
  },
  total_warranty: {
    type: Sequelize.INTEGER
  },
  remaining_warranty: {
    type: Sequelize.INTEGER
  }
});

module.exports = MailingList;
