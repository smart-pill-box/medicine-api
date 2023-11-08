export const createAccountSchema = {
    body: {
        type: "object",
        properties: {
            mainProfileName: {
                type: "string",
                minLength: 1,
                maxLength: 255
            }
        },
        required: [
            "mainProfileName"
        ],
        additionalProperties: false
    } as const
}

export const getAccountSchema = {
    params: {
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
    } as const
}
