import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne } from "typeorm";
import { PillRoutineStatus, PillRoutine } from ".";

@Entity({ name: "pill_routine_status" })
export class PillRoutineStatusEvent {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type) => PillRoutineStatus)
    status: PillRoutineStatus;

    @ManyToOne((type) => PillRoutine, (pillRoutine)=>pillRoutine.statusEvents)
    pillRoutine: PillRoutine;

    @Column({type: "timestamp", "name": "event_datetime"})
    eventDatetime: Date;
}

