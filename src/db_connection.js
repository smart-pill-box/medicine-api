const { Sequelize } = require("sequelize"); 

const sequelize = new Sequelize("my_db", "my_user", "my_pwd", {
    host: "db",
    port: "5432",
    dialect: "postgres"
});
  
module.exports = sequelize;