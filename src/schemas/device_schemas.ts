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

export const updateDeviceIpSchema = {
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
    } as const,
    body: {
        type: "object",
        properties: {
            deviceIp: {
                type: "string",
                minLength: 7, // 0.0.0.0
                maxLength: 15,
								pattern: "\b(?:\d{1,3}\\.){3}\d{1,3}\b"
            }
        },
        required: [
            "deviceIp"
        ],
        additionalProperties: false
    } as const
}
