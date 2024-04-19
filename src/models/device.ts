import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne } from "typeorm";
import { ProfileDevice } from ".";

@Entity({ name: "device" })
export class Device {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column({ type: "char", length: 36, name: "device_key" })
    deviceKey: string;

    @Column({ type: "varchar", length: 15, name: "device_ip" })
    deviceIp: string;

    @OneToOne((type) => ProfileDevice, (profileDevice) => profileDevice.device, {
        cascade: ["insert", "update"]
    })
    profileDevice: ProfileDevice;
}
