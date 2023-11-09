import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne } from "typeorm";

@Entity({ name: "pill_routine_status" })
export class PillRoutineStatus {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column({ type: "varchar", length: 50, name: "enumerator" })
    enumerator: string;
}

