export const createProfileParamsSchema = {
    type: "object",
    properties: {
        accountKey: {
            type: "string",
            minLength: 36,
            maxLength: 36
        }
    },
    required: ["accountKey"],
    additionalProperties: false
} as const;

export const createProfileBodySchema =  {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 255
        }
    },
    required: [
        "name"
    ],
    additionalProperties: false
} as const;

export const getProfileParamsSchema = {
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
    required: [
        "accountKey",
        "profileKey"
    ],
    additionalProperties: false
} as const;