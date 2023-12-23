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
    avatar_number               INTEGER NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(profile_key)
);

CREATE TABLE pill_routine_type(
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(enumerator)
);

INSERT INTO pill_routine_type (enumerator) VALUES 
('weekdays'),
('dayPeriod');

CREATE TABLE pill_routine_status (
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(enumerator)
);

INSERT INTO pill_routine_status (enumerator) VALUES 
('active'),
('updated'),
('canceled');


CREATE TABLE pill_routine (
    id                          SERIAL PRIMARY KEY,
    profile_id                  INTEGER NOT NULL REFERENCES profile(id),
    pill_routine_type_id        INTEGER NOT NULL REFERENCES pill_routine_type(id),
    status_id                   INTEGER NOT NULL REFERENCES pill_routine_status(id),
    pill_routine_key            CHAR(36) NOT NULL,
    start_datetime              TIMESTAMP NOT NULL,
    expiration_datetime         TIMESTAMP,
    pill_routine_data           JSONB NOT NULL,
    name                        VARCHAR(255) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW()),
    UNIQUE(pill_routine_key)
);

CREATE TABLE pill_routine_status_event (
    id                          SERIAL PRIMARY KEY,
    status_id                   INTEGER NOT NULL REFERENCES pill_routine_status(id),
    pill_routine_id             INTEGER NOT NULL REFERENCES pill_routine(id),
    event_datetime              TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_routine_version (
    id                          SERIAL PRIMARY KEY,
    origin_routine_id           INTEGER NOT NULL REFERENCES pill_routine(id),
    updated_routine_id          INTEGER NOT NULL REFERENCES pill_routine(id),
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

CREATE TABLE modified_pill_status (
    id                          SERIAL PRIMARY KEY,
    enumerator                  VARCHAR(50) NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

INSERT INTO modified_pill_status (enumerator) VALUES
('created'),
('loaded'),
('reeschaduled'),
('canceled'),
('manualyConfirmed'),
('pending'),
('pillBoxConfirmed');

CREATE TABLE modified_pill (
    id                          SERIAL PRIMARY KEY,
    pill_routine_id             INTEGER NOT NULL REFERENCES pill_routine(id),
    status_id                   INTEGER NOT NULL REFERENCES modified_pill_status(id),
    pill_datetime               TIMESTAMP NOT NULL,
    quantity                    INTEGER NOT NULL,
    confirmation_datetime       TIMESTAMP,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE modified_pill_status_event (
    id                          SERIAL PRIMARY KEY,
    modified_pill_id            INTEGER NOT NULL REFERENCES modified_pill(id),
    status_id                   INTEGER NOT NULL REFERENCES modified_pill_status(id),
    event_datetime              TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);

CREATE TABLE pill_reeschadule (
    id                          SERIAL PRIMARY KEY,
    reeschaduled_pill_id        INTEGER NOT NULL REFERENCES modified_pill(id),
    new_pill_id                 INTEGER NOT NULL REFERENCES modified_pill(id),
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
    modified_pill_id            INTEGER NOT NULL REFERENCES modified_pill(id),
    profile_device_id           INTEGER NOT NULL REFERENCES profile_device(id),
    position                    INTEGER NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT(NOW())
);
