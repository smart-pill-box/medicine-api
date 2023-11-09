import { DataSource } from "typeorm";
import { 
    Account, 
    Device, 
    Profile, 
    ProfileDevice,
    PillRoutine,
    PillRoutineStatus,
    PillRoutineStatusEvent,
    PillRoutineType,
} from "./models";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "db",
    port: 5432,
    username: "my_user",
    password: "my_pwd",
    database: "my_db",
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
    ],
});
