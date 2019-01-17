const Raid = require('../Raid.js')
const Attendee = require('../Attendee.js')
const Discord = require('discord.js')

var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();

var raidtest = {};
const userInRaid = {
    id: "123",
    username: "dave's username",
    toString: () => `<@${this.id}>`,
    count: 1
};
const user2InRaid = {
    id: "324",
    username: "another user",
    toString: () => `<@${this.id}>`,
    count: 3
};
const userNotInRaid = {
    id: "757",
    username: "Shouldn't be in the raid",
    toString: () => `<@${this.id}>`,
    count: 3
};


describe("Raid", function() {
    raidtest = new Raid("CD", "1:00", 150, "here", userInRaid, 2);
    it('should have a string id', function() {
        expect(raidtest.id).to.be.a('string')
    });
    it('should have a count that is a number and greater than 0', function() {
        expect(raidtest.total()).to.be.a('number').that.is.greaterThan(0);
    });
    it('should have the user in the raid', function() {
        expect(raidtest.userInRaid(userInRaid)).to.exist
        expect(raidtest.userInRaid(user2InRaid)).to.not.exist
        expect(raidtest.userInRaid(userNotInRaid)).to.not.exist
    })
    describe('Add user to raid', function() {
        it('should add a user to the raid', function() {
            raidtest.addToRaid(user2InRaid)
            expect(raidtest.userInRaid(userInRaid)).to.exist
            expect(raidtest.userInRaid(user2InRaid)).to.exist
            expect(raidtest.userInRaid(userNotInRaid)).to.not.exist
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