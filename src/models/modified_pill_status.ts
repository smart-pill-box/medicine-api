import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutineStatus, PillRoutine } from ".";
import { PillStatus } from "../concepts/pill";

@Entity({ name: "modified_pill_status" })
export class ModifiedPillStatus {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column({type: "varchar", length: "50", "name": "enumerator"})
    enumerator: PillStatus;
}

