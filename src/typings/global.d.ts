namespace NodeJS {
    interface ProcessEnv {
        KC_ENDPOINT: string;
        KC_REALM: string;
        MEDICINE_API_DB_NAME: string;
        MEDICINE_API_DB_USER: string;
        MEDICINE_API_DB_PASS: string;
        MEDICINE_API_DB_HOST: string;
        MEDICINE_API_DB_PORT: number;
        CA_BUNDLE_ABS_PATH: string;
        ENV: "local" | "prod";
    }
  }