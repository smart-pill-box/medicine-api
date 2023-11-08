import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Account, Profile, Device } from "."; // Assuming Account is exported as a default export

@Entity({ name: "profile_device" })
export class ProfileDevice {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @OneToOne((type) => Device, (device) => device.profileDevice, {
        nullable: false, 
        cascade: ["insert", "update"]
    })
    @JoinColumn({ name: "device_id"})
    device: Device;

    @ManyToOne((type) => Profile, (profile) => profile.profileDevices, {
        nullable: false,
        cascade: ["insert", "update"]
    })
    @JoinColumn({ name: "profile_id" })
    profile: Profile;
}

