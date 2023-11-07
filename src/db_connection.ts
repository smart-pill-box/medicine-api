import { DataSource } from "typeorm";
import { Account, Profile } from "./models";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "db",
    port: 5432,
    username: "my_user",
    password: "my_pwd",
    database: "my_db",
    synchronize: false,
    logging: true,
    entities: [Account, Profile],
});
