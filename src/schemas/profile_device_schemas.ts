export const createProfileDeviceSchema = {
    params: {
        type: "object",
        properties: {
            accountKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            },
            profileKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey"],
        additionalProperties: false
    } as const,

    body: {
        type: "object",
        properties: {
            deviceKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            },
						name: {
							type: "string",
							minLength: 0,
							maxLength: 255
						}
        },
        required: [
            "deviceKey",
						"name"
        ],
        additionalProperties: false
    } as const
}
