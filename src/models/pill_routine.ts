import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToMany, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, Profile } from ".";

@Entity({ name: "pill_routine" })
export class PillRoutine {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type)=>PillRoutineStatus, {
        eager: true
    })
    @JoinColumn({ name: "status_id" })
    status: PillRoutineStatus;

    @ManyToOne((type)=>PillRoutineType, {
        eager: true
    })
    @JoinColumn({ name: "pill_routine_type_id" })
    pillRoutineType: PillRoutineType;

    @ManyToOne((type)=>Profile)
    @JoinColumn({ name: "profile_id" })
    profile: Profile;

    @OneToMany((type)=>PillRoutineStatusEvent, (statusEvent) => statusEvent.pillRoutine, {
        cascade: ["insert", "update"],
        eager: true
    })
    statusEvents: PillRoutineStatusEvent[];

    @Column({ type: "char", length: 36, name: "pill_routine_key" })
    pillRoutineKey: string;

    @Column({ type: "date", name: "start_date" })
    startDate: string;

    @Column({ type: "date", name: "expiration_date" })
    expirationDate: string;

    @Column({ type: "jsonb", name: "pill_routine_data" })
    pillRoutineData: {[key: string]: any};

    @Column({type: "varchar", length: "255", name: "name"})
    name: string;
}
