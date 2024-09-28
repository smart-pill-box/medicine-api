
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "./device";
import { ModifiedPill } from "./modified_pill";

@Entity({ name: "device_pill" })
export class DevicePill {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

		@Column({ name: "pill_datetime", type: "timestamp" })
		pillDatetime: Date;

		@Column({ name: "position", type: "integer" })
		position: number;

		@Column({ name: "device_pill_key", type: "varchar" })
		devicePillKey: string;

		@ManyToOne((type) => Device)
		@JoinColumn({ name: "device_id" })
		device: Device;

		@OneToOne((type) => ModifiedPill, { nullable: true })
		modifiedPill: ModifiedPill;
}

