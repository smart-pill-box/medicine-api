import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { PillRoutineStatus, PillRoutine, ModifiedPillStatusEvent, ModifiedPillStatus, ModifiedPill } from ".";

@Entity({ name: "pill_reeschadule" })
export class PillReeschadule {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @OneToOne((type) => ModifiedPill, { eager: true })
    @JoinColumn({ name: "reeschaduled_pill_id" })
    reeschaduledPill: ModifiedPill;

    @OneToOne((type) => ModifiedPill, { eager: true })
    @JoinColumn({ name: "new_pill_id" })
    newPill: ModifiedPill;
}

