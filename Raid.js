const constants = require('./constant.json');
const pokemon = require('./pokemon.js')
const Discord = require('discord.js')
const Attendee = require('./Attendee.js').Attendee
let config = {};

// Check for config file
if (process.argv[2]) {
    let configfile = './' + process.argv[2]
    config = require(configfile);
} else {
    console.error("No config file given.  start with node Raider.js configFileName")
}

class Raid {

    /**
     * Raid object that represents a raid event.  Creating one of these implies that a group of people will be heading to a gym to take on a raid.
     * @param {String} id 2-Character ID that will represent the raid in the ActiveRaids array in the main program
     * @param {String} time The time value to display for when the raid starts.  Intentionally not actually a time.
     * @param {String | Number} poke The pokemon identifier.  Could be the name, could be the number.
     * @param {String} location Where the raid is supposed to take place
     * @param {Discord.User} owner The user who created the raid
     * @param {Integer} timeout Number of milliseconds the raid should exist.  It will autodelete after the time expires.
     * @param {Integer} guests How many people the creator is bringing
     */
    constructor(id, time, poke, location, owner, guests = 1) {
        this.id = id
        this.time = time;
        this.location = location;
        this.gym = location;
        this.locationComment = "";
        this.poke = {};
        this.poke.id = pokemon.interpretPoke(poke);
        this.poke.name = constants.pokelist[this.poke.id - 1] ? constants.pokelist[this.poke.id - 1] : poke;
        this.owner = owner;
        this.expires = config.EXMon.includes(this.poke.id) ? Date.now() + config.timeoutEX : Date.now() + config.timeoutNormal;
        this.channels = [];
        this.attendees = new Discord.Collection();
        //  this.potential = {};  //TODO:  "Maybe" a raid; potentially joining
        //  this.comments = {};   //TODO:  Add in a way for users to add comments to the raid
        this.addToRaid(owner, guests)
    }

    save() {
        let raid = {};
        raid.id = this.id;
        raid.time = this.time;
        raid.location = this.location;
        raid.gym = this.gym;
        raid.locationComment = this.locationComment;
        raid.poke = this.poke;
        raid.owner = { id: this.owner.id };
        raid.expires = this.expires;
        raid.channels = this.channels;
        raid.attendees = this.attendees.map((attendee) => attendee.id);
        return raid
    }

    addMessage(channel, message) {
        this.channels.pop([channel.id, message.id])
    }

    userInRaid(user) {
        return this.attendees.get(user.id)
    }

    /**
     * Adds a user and guests to the raid
     * @param {User} user 
     * @param {int} count 
     * @returns 0 if fail, user's count if success
     */
    // add a user to the raid
    addToRaid(user, count = 1) {
        // check if the user is already in the raid
        if (this.attendees.get(user.id)) {
            // if the count is different
            if (this.attendees.get(user.id).count != count) {
                this.attendees.get(user.id).count = count
                return count;
            }
            return 0;
        } else {
            this.attendees.set(user.id, new Attendee(user.id, user.username, user.toString(), count))
            return count;
        }
    }

    // Removes the user from the raid
    removeFromRaid(user) {
        return this.attendees.delete(user.id)
    }

    /**
     * @returns the total count of attendees registered for the raid
     */
    total() {
        let sum = 0;
        sum += this.attendees.forEach((attendee) => attendee.count)
    }

    toString() {
        let str = ""
        str += `**Raid ID: ${this.id}**\n`;
        str += `\tTime: ${this.time}\n`;
        str += `\tPokemon: #${ this.poke.id} ${this.poke.name}\n`;
        str += `\tLocation: ${this.location}\n`;
        if (this.gym != this.location) {
            str += `\tGym:${this.gym}\n`
        }
        str += `\tOrganizer: ${this.owner.mention}\n`;
        str += `\tAttendees:`
        str += this.listAttendees()
        str += `\tTotal Attendees: ${this.total()}`
        return str;
    }

    /** returns the @mentions of all the attendees as a string. */
    listAttendees() {
        let str = ""
        this.attendees.forEach((attendee) => {
            str += `\t\t${attendee.count}\t - ${attendee.username}\t - ${attendee.mention}\n`
        })
        return str;
    }

    atAttendees() {
        let str = "";
        this.attendees.forEach((attendee) => {
            str += attendee.mention + ", ";
        });
        str.substr(0, str.length - 2);
        return str;
    }

    embed() {
        let emb = new Discord.RichEmbed();
        emb.setTitle("Raid Information");
        emb.setColor(0xEE6600).setTimestamp();
        if (constants.pokelist[this.poke.id]) {
            emb.setAuthor("RaiderBot_" + this.poke.name, "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
            emb.setThumbnail("https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
        } else {
            emb.setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
            emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
        }
        let str = `**Time: ** ${this.time}
            **Location: **${this.location}\n`
        if (this.gym != this.location) {
            str += `**Gym: **: ${this.gym}\n`
        }
        str += `**Pokemon: **#${this.poke.id} ${this.poke.name}
            Self-destructs at: ${new Date(this.expires).toLocaleTimeString()}
            **Total Attendees: **${this.total()}`
            //  **Attendee List:**
            //  ${this.listAttendees()}
        emb.addField("Raid " + this.id, str);
        return emb;
    }


    /**
     * Checks if the user owns the raid (or is me).  Used in things like transfering, merging, and inactivating raids
     * @returns True if the message is owned by this raid's owner, if the user is this raid's owner, or if it's from the admin.
     */
    authorized(messageOrUser) {
        if (typeof(messageOrUser) == "Message") {
            return (this.owner.id == messageOrUser.author.id || messageOrUser.author.id == '218550507659067392') // Admin :)
        } else if (typeof(messageOrUser) == "User") {
            return (this.owner.id == messageOrUser.id || messageOrUser.id == '218550507659067392')
        }
    }

    messageRaid(channel, fwdmessage, client) {
        this.attendees.forEach((attendee) => {
            client.users.get(attendee.id).createDM().then(
                (dm) => {
                    dm.send("Message from one of your raids in the " + channel + " channel")
                })
        });


        channel.send(this.atAttendees() + nl + fwdmessage).then(
            console.log(tab + tab + fwdmessage)
        )
    };



}

module.exports.Raid = Raid