import {Column, PrimaryGeneratedColumn, Entity, ManyToOne} from "../../../../src";
import {Country} from "./Country";

@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Country, (country) => country.states)
    country: Country;
}
