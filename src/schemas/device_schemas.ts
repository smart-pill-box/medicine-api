export const createDeviceSchema = {
    body: {
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
    } as const
}

export const getDeviceSchema = {
    params: {
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
    } as const
}
