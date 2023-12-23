export const createPillRoutineSchema = {
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
            pillRoutineType: {
                type: "string",
                minLength: 1,
                maxLength: 50
            },
            name: {
                type: "string",
                minLength: 1,
                maxLength: 255
            },
            expirationDatetime: {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                minLength: 24,
                maxLength: 24
            },
            startDatetime: {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                minLength: 24,
                maxLength: 24
            },
            pillRoutineData: {
                type: "object"
            }
        },
        required: [
            "pillRoutineType",
            "pillRoutineData",
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

export const getPillRoutineModifiedPills = {
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
            },
            pillRoutineKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey", "pillRoutineKey"],
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

export const updatePillRoutineSchema = {
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
            },
            pillRoutineKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey", "pillRoutineKey"],
        additionalProperties: false
    } as const,

    body: {
        type: "object",
        properties: {
            pillRoutineType: {
                type: "string",
                minLength: 1,
                maxLength: 50
            },
            expirationDatetime: {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                minLength: 24,
                maxLength: 24
            },
            startDatetime: {
                type: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                minLength: 24,
                maxLength: 24
            },
            pillRoutineData: {
                type: "object"
            }
        },
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

export const getPillRoutineSchema = {
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
            },
            pillRoutineKey: {
                type: "string",
                minLength: 36,
                maxLength: 36
            }
        },
        required: ["accountKey", "profileKey", "pillRoutineKey"],
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
