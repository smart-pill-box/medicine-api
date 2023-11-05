import { Account } from "../models";
import { ProfileDto } from "./profile_dto";

export class AccountDto {
    static toClientResponse(account: Account) {
        const { accountKey, mainProfileKey } = account;
        const profiles = account.profiles.map((profile)=>{
            return ProfileDto.toClientResponse(profile)
        });
        
        return {
            accountKey: accountKey,
            mainProfileKey: mainProfileKey,
            profiles: profiles
        };
    }
}
