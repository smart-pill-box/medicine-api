const { v4: uuidv4 } = require('uuid');
const { Account, Profile } = require("../models");
const AccountDto = require("../dtos/account_dto");

async function accountRoutes(server){
    server.post(
        "/account",
        {
            schema: {
                body: {
                    type: "object",
                    properties: {
                        mainProfileName: {
                            type: "string",
                            minLength: 1,
                            maxLength: 255
                        }
                    },
                    required: [
                        "mainProfileName"
                    ]
                }
            }
        },
        async (req, resp)=>{
            const mainProfileKey = uuidv4();

            const newAccount = await Account.create({
                accountKey: uuidv4(),
                mainProfileKey: mainProfileKey,
            });

            const mainProfile = await newAccount.createProfile({
                name: req.body.mainProfileName,
                profileKey: mainProfileKey,
            });

            await newAccount.addProfile(mainProfile);

            req.transaction.commit();

            resp.status(201).send(AccountDto.toClientResponse(newAccount));
    }); 
}

module.exports = accountRoutes