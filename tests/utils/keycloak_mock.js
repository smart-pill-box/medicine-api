const jwt = require("jsonwebtoken");
const fs = require("fs");
const { createExpectation } = require("./mock");
const path = require('path');
const { createPublicKey, createPrivateKey } = require("crypto");

const kid = "VLy-7y_8ewy57F-pRvfoKOX1t19Mo4Ha3bSiuMQGu5A";
const pubKey = createPublicKey(fs.readFileSync(path.resolve(__dirname, "../kc_test_pub_key.pub"), "utf-8"));
const privKey = createPrivateKey(fs.readFileSync(path.resolve(__dirname, "../kc_test_priv_key.key"), "utf-8"));

const keys = [
    {
        ...pubKey.export({ format: "jwk" }),
        kid: kid
    }
]


async function createJwkExpectation(){
    await createExpectation({
        method: "GET",
        path: "/keycloak/realms/test_realm/protocol/openid-connect/certs",
        responseStatus: 200,
        responseBody: {
            keys: keys
        }
    })
}

function createSignedToken(accountKey, {
    expiresIn=undefined,
    notBefore=undefined
}={}){
    const signed = jwt.sign({
        sub: accountKey
    }, privKey, {
        header: {
            kid: kid
        },
        ...(expiresIn && {expiresIn: expiresIn}),
        ...(notBefore && {notBefore: notBefore}),
        algorithm: "RS256"
    });

    return signed
}

module.exports = {
    createJwkExpectation,
    createSignedToken
}