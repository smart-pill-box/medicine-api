import { Profile } from "../models";

export class ProfileDto {
    static toClientResponse(profile: Profile) {
        const { profileKey, name } = profile;
        return {
            profileKey: profileKey,
            name: name
        };
    }
}
