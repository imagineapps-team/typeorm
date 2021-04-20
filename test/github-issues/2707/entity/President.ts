import {Column, Entity, PrimaryGeneratedColumn} from "../../../../src";

@Entity()
export class President {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
