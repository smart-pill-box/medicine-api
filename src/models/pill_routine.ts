import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToMany, ManyToOne } from "typeorm";
import { PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType } from ".";

@Entity({ name: "pill_routine" })
export class PillRoutine {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type)=>PillRoutineStatus)
    status: PillRoutineStatus;

    @ManyToOne((type)=>PillRoutineType)
    type: PillRoutineType;

    @OneToMany((type)=>PillRoutineStatusEvent, (statusEvent) => statusEvent.pillRoutine, {
        cascade: ["insert", "update"]
    })
    statusEvents: PillRoutineStatusEvent[];

    @Column({ type: "char", length: 36, name: "pill_routine_key" })
    pillRoutineKey: string;

    @Column({ type: "date", name: "start_date" })
    startDate: string;

    @Column({ type: "date", name: "expiration_date" })
    expirationDate: string;

    @Column({ type: "jsonb", name: "pill_routine_data" })
    pillRoutineData: object;

    @Column({type: "varchar", length: "255", name: "name"})
    name: string;
}
