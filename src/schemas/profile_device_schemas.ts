export const createProfileDeviceParamsSchema = {
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
} as const;

export const createProfileDeviceBodySchema =  {
    type: "object",
    properties: {
        deviceKey: {
            type: "string",
            minLength: 36,
            maxLength: 36
        }
    },
    required: [
        "deviceKey"
    ],
    additionalProperties: false
} as const;
