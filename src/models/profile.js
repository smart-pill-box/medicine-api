const sequelize = require("../db_connection");
const { DataTypes, Model } = require("sequelize");
const { Account } = require("./account");

class Profile extends Model {}

Profile.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "name"
    },
    profileKey: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "profile_key"
    }
}, {
    sequelize,
    modelName: "Profile",
    tableName: "profile",
    timestamps: false
});

Profile.account = Profile.belongsTo(sequelize.models.Account, {
    as: "account",
    foreignKey: {
        name: "accountId",
        field: "account_id",
        allowNull: false
    }
});
sequelize.models.Account.profiles = sequelize.models.Account.hasMany(Profile, {
    as: "profiles",
    foreignKey: {
        name: "accountId",
        field: "account_id",
        allowNull: false
    }
});

module.exports = Profile
