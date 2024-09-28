import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne } from "typeorm";
import { DevicePill, ProfileDevice } from ".";

@Entity({ name: "device" })
export class Device {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column({ type: "char", length: 36, name: "device_key" })
    deviceKey: string;

    @Column({ type: "varchar", length: 15, name: "device_ip" })
    deviceIp: string;

	@Column({ type: "integer", name: "max_positions" })
	maxPositions: number;

    @OneToOne((type) => ProfileDevice, (profileDevice) => profileDevice.device, {
        cascade: ["insert", "update"]
    })
    profileDevice: ProfileDevice;

	@OneToMany((type) => DevicePill, (devicePill) => devicePill.device)
	devicePills: DevicePill[];
}
