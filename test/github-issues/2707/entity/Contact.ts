import {Column, PrimaryGeneratedColumn, Entity, ManyToOne} from "../../../../src";
import {Address} from "./Address";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => Address, { eager: true })
    address: Address;

}
