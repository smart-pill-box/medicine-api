const sequelize = require("../db_connection");
const { DataTypes, Model } = require("sequelize");

class Account extends Model {}

Account.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accountKey: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "account_key"
    },
    mainProfileKey: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "main_profile_key"
    }
}, {
    sequelize,
    modelName: "Account",
    tableName: "account",
    timestamps: false
});

module.exports = Account;
