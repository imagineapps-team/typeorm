import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection, In, Not} from "../../../src";
import {President} from "./entity/President";
import {Country} from "./entity/Country";
import {Address} from "./entity/Address";
import {State} from "./entity/State";
import {Contact} from "./entity/Contact";
import {expect} from "chai";

describe("github issues > #2733 should Allow WHERE clause on joined columns", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should Allow WHERE clause on joined columns", async () =>
        Promise.all(
            connections.map(async (connection) => {
                const manager = connection.manager;

                const president1 = new President();
                president1.name = "John Doe";
                await manager.save(president1);

                const president2 = new President();
                president2.name = "Jane Doe";
                await manager.save(president2);

                const state1 = new State();
                state1.name = "Foo Bar State 1";
                await manager.save(state1);

                const state2 = new State();
                state2.name = "Foo Bar State 2";
                await manager.save(state2);

                const country1 = new Country();
                country1.name = "United States Of America";
                country1.president = president1;
                country1.states = [
                    state1
                ];
                await manager.save(country1);

                const country2 = new Country();
                country2.name = "Brasil";
                country2.president = president2;
                country2.states = [
                    state2,
                ];
                await manager.save(country2);

                const address1 = new Address();
                address1.street = "Foo Street 1";
                address1.city = "Bar City 1";
                address1.country = country1;
                await manager.save(address1);

                const address2 = new Address();
                address2.street = "Foo Street 2";
                address2.city = "Bar City 2";
                address2.country = country2;
                await manager.save(address2);

                const contact1 = new Contact();
                contact1.name = "Richard Joe";
                contact1.address = address1;
                await manager.save(contact1);

                const contact2 = new Contact();
                contact2.name = "Mr America";
                contact2.address = address2;
                await manager.save(contact2);

                const expectedCountryUnitedStatesOfAmerica = {
                    id: 1,
                    name: "United States Of America",
                    president: {
                        id: 1,
                        name: "John Doe",
                    },
                    states: [
                        {
                            id: 1,
                            name: "Foo Bar State 1"
                        },
                    ],
                };

                const expectedCountryBrasil = {
                    id: 2,
                    name: "Brasil",
                    president: {
                        id: 2,
                        name: "Jane Doe",
                    },
                    states: [
                        {
                            id: 2,
                            name: "Foo Bar State 2"
                        },
                    ],
                };

                const expectedAddress1 = {
                    id: 1,
                    street: "Foo Street 1",
                    city: "Bar City 1",
                    country: expectedCountryUnitedStatesOfAmerica,
                };

                const expectedAddress2 = {
                    id: 2,
                    street: "Foo Street 2",
                    city: "Bar City 2",
                    country: expectedCountryBrasil,
                };

                const expectedWhereRichardJoe ={
                    id: 1,
                    name: "Richard Joe",
                    address: expectedAddress1,
                };

                const expectedWhereMrAmerica = {
                    id: 2,
                    name: "Mr America",
                    address: expectedAddress2,
                };


                const contactRepository = connection.getRepository(Contact);

                const whereContactByPresidentsName = await contactRepository.find({
                    where: {
                        address: {
                            country: {
                                president: {
                                    name: In(["Jane Doe", "John Doe"])
                                },
                            },
                        },
                    },
                });

                const expectedWhereByPresidents = [expectedWhereRichardJoe, expectedWhereMrAmerica];

                expect(whereContactByPresidentsName).to.be.eql(expectedWhereByPresidents);


                const whereContactByPresidentsId = await contactRepository.find({
                    where: {
                        address: {
                            country: {
                                presidentId: In([1, 2]),
                            },
                        },
                    },
                });

                expect(whereContactByPresidentsId).to.be.eql(expectedWhereByPresidents);

                const whereContactByPresidentId = await contactRepository.findOne({
                    where: {
                        address: {
                            country: {
                                presidentId: 2,
                            },
                        },
                    },
                });

                expect(whereContactByPresidentId).to.be.eql(expectedWhereMrAmerica);


                const whereContactByPresidentName = await contactRepository.findOne({
                    where: {
                        address: {
                            country: {
                                president: {
                                    name: "Jane Doe"
                                },
                            },
                        },
                    },
                });

                expect(whereContactByPresidentName).to.be.eql(expectedWhereMrAmerica);


                const whereContactByAddressCity = await contactRepository.find({
                    where: {
                        address: {
                            city: "Bar City 2"
                        },
                    },
                });

                const expectedWhereContactByAddressCity = [expectedWhereMrAmerica];

                expect(whereContactByAddressCity).to.be.eql(expectedWhereContactByAddressCity);


                const addressRepository = connection.getRepository(Address);

                const whereAddressByContact = await addressRepository.find({
                    relations: ["contacts"],
                    where: {
                        contacts: {
                            name: "Richard Joe"
                        }
                    }
                });

                const expectedAddressByContact = [{
                    ...expectedAddress1,
                    contacts: [
                        expectedWhereRichardJoe
                    ]
                }];

                expect(whereAddressByContact).to.be.eql(expectedAddressByContact);


                const countryRepository = connection.getRepository(Country);

                const whereCountryByNotState = await countryRepository.find({
                    where: {
                        states: {
                            name: Not("Foo Bar State 1")
                        }
                    }
                });

                expect(whereCountryByNotState).to.be.eql([expectedCountryBrasil]);
            })
        )
    );
});
