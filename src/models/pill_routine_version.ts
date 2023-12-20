import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutine } from ".";

@Entity({ name: "pill_routine_version" })
export class PillRoutineVersion {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type)=>PillRoutine)
    @JoinColumn({ name: "origin_routine_id" })
    originRoutine: PillRoutine;

    @ManyToOne((type)=>PillRoutine)
    @JoinColumn({ name: "updated_routine_id" })
    updatedRoutine: PillRoutine;
}
