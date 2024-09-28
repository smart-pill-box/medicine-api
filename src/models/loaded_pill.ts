

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "loaded_pill" })
export class LoadedPill {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

		@Column({ name: "pill_datetime", type: "timestamp" })
		pillDatetime: Date;

		@Column({ name: "position", type: "integer" })
		position: number;
}

