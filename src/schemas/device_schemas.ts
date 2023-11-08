export const createDeviceBodySchema =  {
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

export const getDeviceParamsSchema = {
    type: "object",
    properties: {
        deviceKey: {
            type: "string",
            minLength: 36,
            maxLength: 36
        }
    },
    required: ["deviceKey"],
    additionalProperties: false
} as const;