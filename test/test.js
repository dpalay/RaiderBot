const Raid = require('../Raid.js')
const Attendee = require('../Attendee.js')
const ActiveRaid = require('../ActiveRaid.js')
const TestClient = require('./mocks/client.js')
const TestStorage = require('./mocks/storage.js')
const TestMessage = require('./mocks/messages.js')
    //const Discord = require('discord.js')
const poke = require('../pokemon.js').interpretPoke
const users = require('./mocks/users.js')
const { general } = require('./mocks/channels.js')

//var assert = require('chai').assert;
var expect = require('chai').expect;
//var should = require('chai').should();

/*
before('Set the raid', function() {
     raidtest = new Raid("CD", "1:00", 150, "here", users.userInRaid);
 })
*/

describe("Pokemon", function() {
    describe("Matching", function() {
        it('should return the right ID for the right pokemon', function() {
            expect(poke("snorelax")).equals(143)
            expect(poke("snorlx")).equal(143)
            expect(poke("snrlax")).equal(143)
            expect(poke(143)).equal(143)
            expect(poke("bulbasaur")).equal(1)
        })
    })
})

describe("Raid", function() {
    /** @type {Raid} */
    let raidtest;
    describe("Raid Creation", function() {
        describe('#new Creating the raid', function() {
            raidtest = new Raid("CD", "1:00", 150, "here", users.user1);
            it('should have a 2 character string id', function() {
                expect(raidtest.id).to.be.a('string')
                expect(raidtest.id).to.have.lengthOf(2, 'Should be 2 digit string')
            });
            it('should not have any channels', function(){
                expect(raidtest.getUniqueChannelList()).to.be.empty
            })
            describe("Add a message to the raid", function() {
                before("",function() {
                    raidtest.addMessage(general, new TestMessage("tm id", users.bot, general, "message content"))
                })

                it("should have a unique channel", function(){
                    expect(raidtest.getUniqueChannelList()).to.have.a.lengthOf(1)
                })
            })
        });

        describe("#new Creating the raid with 2 guests for 1 user", function() {
            it('should have a count that is a number and equal to 2', function() {
                let guests = 2;
                raidtest = new Raid("ED", "1:00", 150, "here", users.user1, guests);
                expect(raidtest.total()).to.be.a('number').equal(guests);
            });
        })
        describe('#new Creating the raid with no guest argument', function() {
            it('should have a count that is a number and equal to 1', function() {
                raidtest = new Raid("CF", "1:00", 150, "here", users.user1);
                expect(raidtest.total()).to.be.a('number').equal(users.user1.count);
            });
        })
    })
    describe("Users in a raid", function() {
        beforeEach(function() {
            raidtest = new Raid("CF", "1:00", 150, "here", users.user1);
        })
        it('Should have the user in the raid', function() {
            expect(raidtest.userInRaid(users.user1)).to.exist
            expect(raidtest.userInRaid(users.user2)).to.not.exist
            expect(raidtest.userInRaid(users.user3)).to.not.exist
        })
        describe('Raid.addUserToRaid Add user to raid', function() {
            it('should add a user to the raid', function() {
                raidtest.addUserToRaid(users.user2)
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
            })
            it('should not duplicate a user who is already in the raid', function() {
                raidtest.addUserToRaid(users.user2)
                let size = raidtest.attendees.size;
                raidtest.addUserToRaid(users.user2)
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
                expect(size).to.equal(raidtest.attendees.size, 'they should be the same size')
            })
        })
        describe('Raid.addUserToRaid Change guests for a user', function() {
            it('should increase the number of guests', function() {
                let count = raidtest.total();

                raidtest.addUserToRaid(users.user1, users.user1.count + 2)
                expect(count).to.be.lessThan(raidtest.total());
            })
        })
        describe('Raid.removeFromRaid Remove user from raid', function() {
            it('should remove a user from the raid', function() {
                raidtest.addUserToRaid(users.user2)
                let bool = raidtest.removeFromRaid(users.user2)
                expect(bool).to.be.true;
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.not.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
            })
            it('should fail to remove a user that is not in the raid', function() {
                let bool = raidtest.removeFromRaid(users.user2)
                expect(bool).to.be.false;
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.not.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
            })
        })
    })
    describe("ActiveRaids", function() {
        let activeRaid;
        let message;
        let raid;
        let count;
        describe("Creating ActiveRaid", function() {
            before(function() {
                activeRaid = new ActiveRaid(new TestClient, new TestStorage, { pointer: 0, quietMode: false, prefix: "!test" })
            })
            it("Shouldn't have any raids", function() {
                expect(activeRaid.size).to.equal(0)
            })
            describe("User1: !test new 1:00,absol,at the gym", function() {
                before(function() {
                    message = new TestMessage("new raid", users.user1, general, "!test new 1:00,absol,at the gym");
                    activeRaid.processMessage(message);
                    raid = activeRaid.first();
                })
                it('should have a raid', function() {
                    expect(activeRaid.size).to.equal(1);
                })
                it("Should be for Absol", function() {
                    expect(raid.poke.name).to.equal("Absol")
                })
                it("Should be 'at the gym'", function() {
                    expect(raid.location).to.equal("at the gym")
                })
                it('Should have 1 attendee', function() {
                    expect(raid.attendees.size).to.equal(1);
                    expect(raid.total()).to.equal(1);
                })
                it("Should have the author as the attendee", function() {
                    expect(raid.userInRaid(message.author)).to.exist;
                })
                it("Should not have the author registered as 'here'", function() {
                    expect(raid.attendees.get(message.author.id).here).to.be.false
                })
                describe(`User2: !test join VW, 1`, function() {
                    before(function() {
                        message = new TestMessage("join raid", users.user2, general, `!test join VW, 1`)
                        raid = activeRaid.first();
                        activeRaid.processMessage(message)
                    })
                    it('should still have a single raid', function() {
                        expect(activeRaid.size, "Should only have 1 raid").to.equal(1);
                    })
                    it("should have multiple attendees", function() {
                        expect(raid.total()).to.equal(2);
                    })
                    describe(`User3: !test join VW 4`, function() {
                        before(function() {
                            message = new TestMessage("Join raid with multiple", users.user3, general, `!test join VW 4`);
                            raid = activeRaid.first();
                            count = raid.total();
                            activeRaid.processMessage(message)
                        })
                        it("should have a new member", function() {
                            expect(count).to.be.lessThan(raid.total());
                            expect(raid.total()).equals(6);
                        })
                        it("Should have user2", function() {
                            expect(raid.userInRaid(users.user2)).to.exist;
                        })
                        it("Should have user3", function() {
                            expect(raid.userInRaid(users.user3)).to.exist;
                        })
                        describe(`User3: !test leave VW`, function() {
                            before(function() {
                                message = new TestMessage("Leave the raid", users.user3, general, `!test leave VW`);
                                raid = activeRaid.first();
                                count = raid.total();
                                activeRaid.processMessage(message);
                            })
                            it("should no longer have as many attendees", function() {
                                expect(count).to.be.greaterThan(raid.total());
                                expect(raid.total()).equals(2);
                            })
                            it("Should have user2", function() {
                                expect(raid.userInRaid(users.user2)).to.exist;
                            })
                            it("Should not have user3", function() {
                                expect(raid.userInRaid(users.user3)).to.not.exist;
                            })
                        })
                    })
                })
            })

        })

    })
})