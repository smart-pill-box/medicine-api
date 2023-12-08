export const createProfileSchema = {
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
    } as const,

    body: {
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
    } as const,

    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
}

export const getProfileSchema = {
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
        required: [
            "accountKey",
            "profileKey"
        ],
        additionalProperties: false
    } as const,

    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
}

export const getProfileDevicesSchema = {
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
        required: [
            "accountKey",
            "profileKey"
        ],
        additionalProperties: false
    } as const,

    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
};

export const getProfilePillRoutinesSchema = {
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
        required: [
            "accountKey",
            "profileKey"
        ],
        additionalProperties: false
    } as const,
    
    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
};

export const getProfilePillsSchema = {
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
        required: [
            "accountKey",
            "profileKey"
        ],
        additionalProperties: false
    } as const,

    querystring: {
        type: "object",
        properties: {
            fromDate: {
                type: "string",
                pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"
            },
            toDate: {
                type: "string",
                pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"
            },
        },
        required: ["fromDate", "toDate"],
        additionalProperties: false
    } as const,
    
    headers: {
        type: "object",
        properties: {
            authorization: {
                type: "string"
            }
        },
        required: [
            "authorization"
        ]
    } as const
};
