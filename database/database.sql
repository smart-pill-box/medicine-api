CREATE TABLE account (
    id                          SERIAL PRIMARY KEY,
    account_key                 CHAR(36) NOT NULL,
    main_profile_key            CHAR(36) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(account_key)
);

CREATE TABLE profile (
    id                          SERIAL PRIMARY KEY,
    account_id                  INTEGER NOT NULL REFERENCES account(id),
    profile_key                 CHAR(36) NOT NULL,
    name                        VARCHAR(255) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(profile_key)
);

CREATE TABLE pill_routine_type(
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(enumerator)
);

CREATE TABLE pill_routine_status (
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(enumerator)
);

CREATE TABLE pill_routine (
    id                          SERIAL PRIMARY KEY,
    profile_id                  INTEGER NOT NULL REFERENCES profile(id),
    pill_routine_type_id        INTEGER NOT NULL REFERENCES pill_routine_type(id),
    status_id                   INTEGER NOT NULL REFERENCES pill_routine_status(id),
    expiration_date             DATE,
    routine_data                JSONB NOT NULL,
    name                        VARCHAR(255) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(name, profile_id)
);

CREATE TABLE pill_routine_status_event (
    id                          SERIAL PRIMARY KEY,
    status_id                   INTEGER NOT NULL REFERENCES pill_routine_status(id),
    pill_routine_id             INTEGER NOT NULL REFERENCES pill_routine(id),
    event_datetime              TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_routine_update_type(
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_routine_update (
    id                          SERIAL PRIMARY KEY,
    pill_routine_id             INTEGER NOT NULL REFERENCES pill_routine(id),
    update_type_id              INTEGER NOT NULL REFERENCES pill_routine_update_type(id),
    pill_datetime               TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_status (
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill (
    id                          SERIAL PRIMARY KEY,
    pill_routine_id             INTEGER NOT NULL REFERENCES pill_routine(id),
    status_id                   INTEGER NOT NULL REFERENCES pill_status(id),
    pill_datetime               TIMESTAMP NOT NULL,
    confirmation_interval       INTERVAL DAY TO SECOND,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_status_event (
    id                          SERIAL PRIMARY KEY,
    pill_id                     INTEGER NOT NULL REFERENCES pill(id),
    status_id                   INTEGER NOT NULL REFERENCES pill_status(id),
    event_datetime              TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE device (
    id                          SERIAL PRIMARY KEY,
    device_key                  CHAR(36) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE profile_device (
    id                          SERIAL PRIMARY KEY,
    device_id                   INTEGER NOT NULL REFERENCES device(id),
    profile_id                  INTEGER NOT NULL REFERENCES profile(id),
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE loaded_pill (
    id                          SERIAL PRIMARY KEY,
    pill_id                     INTEGER NOT NULL REFERENCES pill(id),
    profile_device_id           INTEGER NOT NULL REFERENCES profile_device(id),
    position                    INTEGER NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);
