import { Profile } from "../models";
import { DeviceDto } from "./device_dto";

export class ProfileDto {
    static toClientResponse(profile: Profile) {
        const { profileKey, name } = profile;

        return {
            profileKey: profileKey,
            name: name,
        };
    }
}
