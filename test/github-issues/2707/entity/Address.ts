import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "../../../../src";
import {Country} from "./Country";
import {Contact} from "./Contact";

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    street: string;

    @Column()
    city: string;

    @ManyToOne(type => Country, { eager: true })
    country: Country;

    @OneToMany(() => Contact, contact => contact.address )
    contacts: Contact[];
}
