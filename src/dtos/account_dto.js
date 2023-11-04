const ProfileDto = require("./profile_dto")

class AccountDto {
    static toClientResponse(account) {
        const { accountKey, mainProfileKey } = account;
        console.log(account.toJSON());
        console.log(account.profiles);
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

module.exports = AccountDto;