import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Profile } from ".";

@Entity({ name: "account" })
export class Account {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column({ type: "char", length: 36, name: "account_key" })
    accountKey: string;

    @Column({ type: "char", length: 36, name: "main_profile_key" })
    mainProfileKey: string;

    @OneToMany((type) => Profile, (profile) => profile.account, {
        cascade: ["insert", "update"]
    })
    profiles: Profile[];
}
