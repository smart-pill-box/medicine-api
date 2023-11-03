const { v4: uuidv4 } = require('uuid');
const { Account } = require("../models");

async function accountRoutes(server){
    server.get("/account", async (req, resp)=>{
        const jane = await Account.create({
            accountKey: uuidv4(),
            mainProfileKey: uuidv4()
        });

        req.transaction.commit();

        return jane
    }); 
}

module.exports = accountRoutes