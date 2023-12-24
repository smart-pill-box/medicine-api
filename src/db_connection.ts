import { DataSource, DataSourceOptions } from "typeorm";
import fs from "fs"
import { 
    Account, 
    Device, 
    Profile, 
    ProfileDevice,
    PillRoutine,
    PillRoutineStatus,
    PillRoutineStatusEvent,
    PillRoutineType,
    ModifiedPillStatus,
    ModifiedPill,
    ModifiedPillStatusEvent,
    PillReeschadule,
    PillRoutineVersion,
} from "./models";

let options: DataSourceOptions = {
    type: "postgres",
    host: process.env.MEDICINE_API_DB_HOST,
    port: process.env.MEDICINE_API_DB_PORT,
    username: process.env.MEDICINE_API_DB_USER,
    password: process.env.MEDICINE_API_DB_PASS,
    database: process.env.MEDICINE_API_DB_NAME,
    synchronize: false,
    logging: false,
    entities: [
        Account, 
        Profile,
        Device,
        ProfileDevice,
        PillRoutine,
        PillRoutineStatus,
        PillRoutineStatusEvent,
        PillRoutineType,
        ModifiedPillStatus,
        ModifiedPill,
        ModifiedPillStatusEvent,
        PillReeschadule,
        PillRoutineVersion,
    ],
};

if(process.env.ENV == "prod"){
    options = {
        type: "postgres",
        host: process.env.MEDICINE_API_DB_HOST,
        port: process.env.MEDICINE_API_DB_PORT,
        username: process.env.MEDICINE_API_DB_USER,
        password: process.env.MEDICINE_API_DB_PASS,
        database: process.env.MEDICINE_API_DB_NAME,
        synchronize: false,
        ssl: {
            ca: fs.readFileSync(process.env.CA_BUNDLE_ABS_PATH).toString()
        },
        logging: false,
        entities: [
            Account, 
            Profile,
            Device,
            ProfileDevice,
            PillRoutine,
            PillRoutineStatus,
            PillRoutineStatusEvent,
            PillRoutineType,
            ModifiedPillStatus,
            ModifiedPill,
            ModifiedPillStatusEvent,
            PillReeschadule,
            PillRoutineVersion,
        ],
    };
    
}

export const AppDataSource = new DataSource(options);
