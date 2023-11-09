import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutineStatus, PillRoutine } from ".";

@Entity({ name: "pill_routine_status_event" })
export class PillRoutineStatusEvent {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type) => PillRoutineStatus, {
        eager: true
    })
    @JoinColumn({ name: "status_id" })
    status: PillRoutineStatus;

    @ManyToOne((type) => PillRoutine, (pillRoutine)=>pillRoutine.statusEvents)
    @JoinColumn({ name: "pill_routine_id" })
    pillRoutine: PillRoutine;

    @Column({type: "timestamp", "name": "event_datetime"})
    eventDatetime: Date;
}

