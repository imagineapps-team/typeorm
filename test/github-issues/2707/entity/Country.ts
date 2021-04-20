import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
} from "../../../../src";
import { President } from "./President";
import { State } from "./State";

@Entity()
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ select: false })
    presidentId: number;

    @OneToMany(() => State, (state) => state.country, { eager: true })
    states: State[];

    @ManyToOne((type) => President, { eager: true })
    president: President;
}
