import axios from "axios";
import jwt from "jsonwebtoken"
import jwksRsa, { JwksClient } from "jwks-rsa"

const jwksUri = `${process.env.KC_ENDPOINT}/realms/${process.env.KC_REALM}/protocol/openid-connect/certs`;

const client: JwksClient = jwksRsa({
    jwksUri: jwksUri,
  });

export default async function validateToken(tokenStr: string): Promise<jwt.JwtPayload>{
    try{
        tokenStr = tokenStr.replace(/^Bearer\s+/, "");
        
        const token = jwt.decode(tokenStr, { json: true, complete: true });
        if (!token){
            throw new Error("Invalid Token")
        }

        const pubKey = await client.getSigningKey(token?.header.kid);
    
        const verified = jwt.verify(tokenStr, pubKey.getPublicKey());

        return verified as jwt.JwtPayload;
    
    } catch(err){
        throw(err)
    }

    

}