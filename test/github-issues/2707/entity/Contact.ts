import {Column, PrimaryGeneratedColumn, Entity, ManyToOne} from "../../../../src";
import {Address} from "./Address";
import {JoinColumn} from "../../../../src";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => Address, {eager: true})
    @JoinColumn({name: "addressId", referencedColumnName: "id"})
    address: Address;

    @Column({type: "integer"})
    addressId: number;
}
