import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutineStatus, PillRoutine, ModifiedPillStatusEvent, ModifiedPillStatus } from ".";

@Entity({ name: "modified_pill" })
export class ModifiedPill {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type) => ModifiedPillStatus, {
        eager: true
    })
    @JoinColumn({ name: "status_id" })
    status: ModifiedPillStatus;

    @ManyToOne((type) => PillRoutine, (pillRoutine)=>pillRoutine.statusEvents)
    @JoinColumn({ name: "pill_routine_id" })
    pillRoutine: PillRoutine;

    @OneToMany((type)=>ModifiedPillStatusEvent, (statusEvent) => statusEvent.modifiedPill, {
        cascade: ["insert", "update"],
        eager: true
    })
    statusEvents: ModifiedPillStatusEvent[];

    @Column({type: "timestamp", "name": "pill_datetime"})
    pillDatetime: Date;

    @Column({ type: "integer" })
    quantity: number;

    @Column({ type: "timestamp", name: "confirmation_datetime" })
    confirmationDatetime: Date;

}

