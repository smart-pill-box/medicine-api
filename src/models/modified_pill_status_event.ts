import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { ModifiedPill, ModifiedPillStatus } from ".";

@Entity({ name: "modified_pill_status_event" })
export class ModifiedPillStatusEvent {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @ManyToOne((type) => ModifiedPillStatus, {
        eager: true
    })
    @JoinColumn({ name: "status_id" })
    status: ModifiedPillStatus;

    @ManyToOne((type) => ModifiedPill, (modifiedPill)=>modifiedPill.statusEvents)
    @JoinColumn({ name: "modified_pill_id" })
    modifiedPill: ModifiedPill;

    @Column({type: "timestamp", "name": "event_datetime"})
    eventDatetime: Date;
}

