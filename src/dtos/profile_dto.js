class ProfileDto {
    static toClientResponse(profile) {
        const { profileKey, name } = profile;
        return {
            profileKey: profileKey,
            name: name
        };
    }
}

module.exports = ProfileDto;