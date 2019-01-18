const Raid = require('../Raid.js')
    //const Attendee = require('../Attendee.js')
    //const Discord = require('discord.js')
const poke = require('../pokemon.js').interpretPoke
const users = require('./users.js')

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
    let raidtest = {};
    describe("Raid Creation", function() {
        describe('Creating the raid', function() {
            raidtest = new Raid("CD", "1:00", 150, "here", users.user1);
            it('should have a 2 character string id', function() {
                expect(raidtest.id).to.be.a('string')
                expect(raidtest.id.length).equals(2, 'Should be 2 digit string')
            });
        });



        describe("Creating the raid with 2 guests for 1 user", function() {
            it('should have a count that is a number and equal to 2', function() {
                let guests = 2;
                raidtest = new Raid("ED", "1:00", 150, "here", users.user1, guests);
                expect(raidtest.total()).to.be.a('number').equal(guests);
            });
        })
        describe('Creating the raid with no guest argument', function() {
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
        it('should have the user in the raid', function() {
            raidtest = new Raid("CF", "1:00", 150, "here", users.user1);
            expect(raidtest.userInRaid(users.user1)).to.exist
            expect(raidtest.userInRaid(users.user2)).to.not.exist
            expect(raidtest.userInRaid(users.user3)).to.not.exist
        })
        describe('Add user to raid', function() {
            it('should add a user to the raid', function() {
                raidtest.addToRaid(users.user2)
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
            })
            it('should not duplicate a user who is already in the raid', function() {
                raidtest.addToRaid(users.user2)
                let size = raidtest.attendees.size;
                raidtest.addToRaid(users.user2)
                expect(raidtest.userInRaid(users.user1)).to.exist
                expect(raidtest.userInRaid(users.user2)).to.exist
                expect(raidtest.userInRaid(users.user3)).to.not.exist
                expect(size).to.equal(raidtest.attendees.size, 'they should be the same size')
            })
        })
        describe('Change guests for a user', function() {
            it('should increase the number of guests', function() {
                let count = raidtest.total();

                raidtest.addToRaid(users.user1, users.user1.count + 2)
                expect(count).to.be.lessThan(raidtest.total());
            })
        })
        describe('Remove user from raid', function() {
            it('should remove a user from the raid', function() {
                raidtest.addToRaid(users.user2)
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
})