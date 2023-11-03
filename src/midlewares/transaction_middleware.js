const sequelize = require("../db_connection");


async function createTransaction(req, resp) {
    try {
        const transaction = await sequelize.transaction();
        req.transaction = transaction;
    } catch (err) {
        console.error("Error Initializing Transaction", error);
        resp.code(500).send("Internal Server Error");
    }
};

async function rollbackTransaction(req, resp, err){
    try {
        await req.transaction.rollback();
    } catch (err) {
        console.log("Error in transaction rollback", error);
    }
};

module.exports = {
    createTransaction,
    rollbackTransaction
};