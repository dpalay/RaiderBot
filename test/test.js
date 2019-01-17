const Raid = require('../Raid.js')
const Attendee = require('../Attendee.js')
const Discord = require('discord.js')

const users = require('./users.js')

var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();




describe("Raid", function() {
    let raidtest = {};
    describe('Creating the raid', function() {
        raidtest = new Raid("CD", "1:00", 150, "here", users.userInRaid);
        it('should have a 2 character string id', function() {
            expect(raidtest.id).to.be.a('string')
            expect(raidtest.id.length).equals(2, 'Should be 2 digit string')
        });
    })


    let guests = 2;
    describe(`Creating the raid with ${guests} guests for 1 user`, function() {
        raidtest = new Raid("ED", "1:00", 150, "here", users.userInRaid, guests);
        it(`should have a count that is a number and equal to ${guests}`, function() {
            expect(raidtest.total()).to.be.a('number').equal(guests);
        });
    })
    describe('Creating the raid with no guest argument', function() {
        raidtest = new Raid("CF", "1:00", 150, "here", users.userInRaid);
        it(`should have a count that is a number and equal to ${users.userInRaid.count}`, function() {
            expect(raidtest.total()).to.be.a('number').equal(users.userInRaid.count);
        });
    })
    describe("Users in a raid", function() {


        it('should have the user in the raid', function() {
            expect(raidtest.userInRaid(users.userInRaid)).to.exist
            expect(raidtest.userInRaid(users.user2InRaid)).to.not.exist
            expect(raidtest.userInRaid(users.userNotInRaid)).to.not.exist
        })
        describe('Add user to raid', function() {
            it('should add a user to the raid', function() {
                raidtest.addToRaid(users.user2InRaid)
                expect(raidtest.userInRaid(users.userInRaid)).to.exist
                expect(raidtest.userInRaid(users.user2InRaid)).to.exist
                expect(raidtest.userInRaid(users.userNotInRaid)).to.not.exist
            })
            it('should not duplicate a user who is already in the raid', function() {
                let size = raidtest.attendees.size;
                raidtest.addToRaid(users.user2InRaid)
                expect(raidtest.userInRaid(users.userInRaid)).to.exist
                expect(raidtest.userInRaid(users.user2InRaid)).to.exist
                expect(raidtest.userInRaid(users.userNotInRaid)).to.not.exist
                expect(size).to.equal(raidtest.attendees.size, 'they should be the same size')
            })
        })
        describe('Change guests for a user', function() {
            it('should increase the number of guests', function() {
                let count = raidtest.total();

                raidtest.addToRaid(users.userInRaid, users.userInRaid.count + 2)
                expect(count).to.be.lessThan(raidtest.total());
            })
        })
        describe('Remove user from raid', function() {
            it('should remove a user from the raid', function() {
                let bool = raidtest.removeFromRaid(users.user2InRaid)
                expect(bool).to.be.true;
                expect(raidtest.userInRaid(users.userInRaid)).to.exist
                expect(raidtest.userInRaid(users.user2InRaid)).to.not.exist
                expect(raidtest.userInRaid(users.userNotInRaid)).to.not.exist
            })
            it('should fail to remove a user that is not in the raid', function() {
                let bool = raidtest.removeFromRaid(users.user2InRaid)
                expect(bool).to.be.false;
                expect(raidtest.userInRaid(users.userInRaid)).to.exist
                expect(raidtest.userInRaid(users.user2InRaid)).to.not.exist
                expect(raidtest.userInRaid(users.userNotInRaid)).to.not.exist
            })
        })
    })
})

/*


raid = {
    id: "HF",
    time: "1:00",
    poke: {
        id: "131",
        name: "Eevee"
    },
    owner: {},
    expires: "",
    channels: {},
    attendees: {}
}



message = {}

channel = {}
client = {}



//RAID

//Test for constructor()

//Test for userInRaid()

//Test for addToRaid()

//Test for removeFromRaid()

//Test for total()

//Test for toString()

//Test for listAttendees()

//Test for atAttendees()

//Test for embed()

//Test for authorized()

//test for messageRaid()
*/