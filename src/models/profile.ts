import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "."; // Assuming Account is exported as a default export

@Entity({ name: "profile" })
export class Profile {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type) => Account, (account) => account.profiles, {
        nullable: false, 
        cascade: ["insert", "update"]
    })
    @JoinColumn({ name: "account_id"})
    account: Account;

    @Column({ type: "char", length: 36, name: "profile_key" })
    profileKey: string;

    @Column({ type: "varchar", length: 255, name: "name" })
    name: string;
}

