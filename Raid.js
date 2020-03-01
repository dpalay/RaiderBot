const { pokelist, shinyRate } = require('./constant.json');
const pokemon = require('./pokemon.js');
const Discord = require('discord.js');
const Attendee = require('./Attendee.js');
const BotMessage = require('./BotMessage.js');
const forms = require('./forms.json');
let config = {};

// Check for config file
if (process.argv[2]) {
    try {
        let configfile = './' + process.argv[2];
        config = require(configfile);
    } catch (error) {
        config = require('./tester.json');
    }
} else {
    config = require('./tester.json');
    console.error("No config file given.  start with node Raider.js configFileName");
}

//config = require('./tester.json')
if (typeof shinyRate != 'number') {
    shinyRate = 0
}

class Raid {
    /**
     * Raid object that represents a raid event.  Creating one of these implies that a group of people will be heading to a gym to take on a raid.
     * @param {String} id 2-Character ID that will represent the raid in the ActiveRaids array in the main program
     * @param {String} time The time value to display for when the raid starts.  Intentionally not actually a time.
     * @param {String | Number} poke The pokemon identifier.  Could be the name, could be the number.
     * @param {String} location Where the raid is supposed to take place
     * @param {Discord.User} owner The user who created the raid
     * @param {Number} timeout Number of milliseconds the raid should exist.  It will autodelete after the time expires.
     * @param {Number} guests How many people the creator is bringing
     */
    constructor(id, time, poke, location, owner, guests = 1) {
        // console.log(poke)
        this.id = id;
        this.time = time;
        this.location = location;
        this.gym = location;
        this.locationComment = "";
        this.poke = {};
        if (/^\d+$/.test(poke.toString())) {
            this.poke.original_name = '';
        } else {
            this.poke.original_name = poke;
        }
        this.setPokemon(pokemon.interpretPoke(poke));
        // this.poke.id = pokemon.interpretPoke(poke); //setPokemon() just is just these 2 lines (redundant?)
        // this.poke.name = pokelist[this.poke.id - 1] ? pokelist[this.poke.id - 1] : poke;
        this.owner = owner;
        this.expires = config.EXMon.includes(this.poke.id) ? Date.now() + config.timeoutEX : Date.now() + config.timeoutNormal;
        /** @type {BotMessage[]} */
        this.channels = [];
        /** @type {Discord.Collection<string,Attendee>} */
        this.attendees = new Discord.Collection();
        //  this.potential = {};  //TODO:  "Maybe" a raid; potentially joining
        //  this.comments = {};   //TODO:  Add in a way for users to add comments to the raid
        this.addUserToRaid(owner, isFinite(guests) && guests > 0 ? guests : 1);
    }

    /**
     * @returns {FlattenedRaid} Returns a "flattened raid" for saving to the disk.  Doesn't save any of the actual discord stuff
     */
    flatten() {
        let raid = {
            id: this.id,
            time: this.time,
            location: this.location,
            gym: this.gym,
            locationComment: this.locationComment,
            poke: this.poke,
            owner: { id: this.owner.id },
            expires: this.expires,
            channels: this.channels.map((bm) => bm.flatten()),
            attendees: this.attendees.map((attendee) => {
                return {
                    id: attendee.id,
                    count: attendee.count,
                    mention: attendee.mention,
                    here: attendee.here,
                    username: attendee.username
                };
            })
        };
        return raid;
    }

    /**
     * 
     * @param {Discord.Channel} channel 
     * @param {Discord.Message} message 
     * @param {"info" | "reply" | "unknown" } type
     */
    addMessage(channel, message, type = "unknown") {
        this.channels.push(new BotMessage(channel, message, type));
    };

    setPokemon(poke) {
        function toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }
        this.poke.id = pokemon.interpretPoke(poke);
        this.poke.name = pokelist[this.poke.id - 1] ? pokelist[this.poke.id - 1] : poke;
        this.poke.shiny = Math.random() * 100 < shinyRate
        if (this.poke.original_name.length == 0) {
            this.poke.original_name = this.poke.name;
        }
        this.poke.form = pokemon.interpretForm(this.poke.original_name, this.poke.id)
        if (this.poke.id == 150 && this.poke.form.toUpperCase() === 'A') {
            this.poke.img = 'pm0150_00_pgo_a'
        } else {
            let pokeIDStr = this.poke.id.toString();
            pokeIDStr = pokeIDStr.padStart(3, '0');
            this.poke.img = pokeIDStr + '_' + forms.pokemon[pokeIDStr]['forms'][this.poke.form]
        }
        if (this.poke.shiny) {
            this.poke.img = this.poke.img + '_shiny'
        }
        // console.log(this.poke)
        if (this.poke.form === 'NORMAL' && !([351, 386, 479].includes(this.poke.id))) { 
            //castform, rotom, deoxys have actual forms called "normal"
            this.poke.display_name = this.poke.name
        } else {
            if (this.poke.id == 150 && this.poke.form.toUpperCase() === 'A') {
                this.poke.display_name = "Armored Mewtwo"
            } else if (this.poke.form.toUpperCase() === 'ALOLA') {
                this.poke.display_name = 'Alolan ' + this.poke.name
            } else {
                this.poke.display_name = this.poke.name + ' ' + toTitleCase(this.poke.form)
            }
        }
    }

    /**
     * @param {Discord.User} user 
     */
    userInRaid(user) {
        return this.attendees.get(user.id);
    };

    /**
     * Checks if the user owns the raid (or is me).  Used in things like transfering, merging, and inactivating raids
     * @returns True if the message is owned by this raid's owner, if the user is this raid's owner, or if it's from the admin.
     * @param {Discord.Message | Discord.User} messageOrUser 
     */
    authorized(messageOrUser) {
        if (messageOrUser instanceof Discord.Message) {
            return (this.owner.id === messageOrUser.author.id || messageOrUser.author.id === '218550507659067392'); // Admin :)
        } else if (messageOrUser instanceof Discord.User) {
            return (this.owner.id === messageOrUser.id || messageOrUser.id === '218550507659067392');
        }
    };

    /**
     * Adds a user and guests to the raid
     * @param {Discord.User | {id: string, username: string, count: number, mention?: string}} user 
     * @param {number} count 
     * @returns 0 if fail, user's count if success
     */
    addUserToRaid(user, count = 1) {
        // check if the user is already in the raid
        let att = this.attendees.get(user.id);
        if (att) {
            // if the count is different
            if (att.count != count) {
                if (count == 0) {
                    this.removeFromRaid(user);
                } else {
                    att.count = count;
                }
                this.updateInfo();
            } else count = 0;
        } else if (parseInt(count) > 0) {
            this.attendees.set(user.id, new Attendee(user.id, user.username, user.mention || `<@${user.id}>`, count));
            this.updateInfo();
        }
        return count;
    };



    updateInfo() {
        this.channels.filter((botChan) => { return botChan.type === "info"; }).forEach((botChan) => {
            botChan.message.edit({ embed: this.embed() }).catch((error) => console.error(error));
        }, this);
    }

    /**
     * Removes the user from the raid
     * @param {Discord.User} user user to remove from the raid
     */
    removeFromRaid(user) {
        return this.attendees.delete(user.id);
    }

    /**
     * Calculates how many people are in the raid
     * @returns {Number} the total count of attendees registered for the raid
     */
    total() {
        var sum = 0;
        this.attendees.forEach((val) => { sum += parseInt(val.count); });
        return sum;
        //return this.attendees.reduce((acc, val) => { return acc + val.count }, 0);

    }

    /**
     * writes out a string for the raid
     * @returns {String} stringified version of the Raid
     */
    toString() {
        let str = "";
        str += `**Raid ID: ${this.id}**\n`;
        str += `\tTime: ${this.time}\n`;
        str += `\tPokemon: #${ this.poke.id} ${this.poke.name}\n`;
        str += `\tLocation: ${this.location}\n`;
        if (this.gym != this.location) {
            str += `\tGym:${this.gym}\n`;
        }
        str += `\tOrganizer: ${this.owner}\n`;
        str += `\tTotal Attendees: ${this.total()}`;
        str += `\tAttendees:`;
        str += this.listAttendees();
        return str;
    }

    /** @returns {string} the roster of attendees with icon for here or not */
    listAttendees() {
        let str = "";
        this.attendees.forEach((attendee) => {
            str += `\t\t${attendee.here ? "✅" : "❓" }${attendee.count}\t - ${attendee.username}\t - ${attendee.mention}\n`;
        });
        return str;
    }

    /** @returns {string} the @mentions of all the attendees as a string. */
    atAttendees() {
        return this.attendees.map((attendee) => attendee.mention).join(", ");
    }

    /**
     * 
     * @param {Discord.Client} client 
     * @param {Attendee | Discord.User} attendee 
     */
    toggleHere(client, attendeeOrUser) {
        /** @type {Attendee} */
        let attendee;
        if (attendeeOrUser instanceof Discord.User) {
            attendee = this.attendees.get(attendeeOrUser.id);
        } else {
            attendee = attendeeOrUser;
        }
        if (attendee && attendee.id && this.attendees.has(attendee.id)) {
            attendee.here = !attendee.here;
            this.updateInfo();
        } else {
            this.addUserToRaid(attendeeOrUser);
            this.toggleHere(client, attendeeOrUser);
        }
    }

    getUniqueChannelList() {
        let botChannels = [];
        for (const botChan of this.channels) {
            botChannels = botChan.buildlist(botChannels);
        }
        return botChannels;
    }

    /**
     * 
     * @param {Discord.Client} client 
     */
    sendStart(client, user) {
        if (this.authorized(user)) {
            this.messageRaid(`${user} has signaled to start the ${this.time} ${this.poke.display_name} raid at ${this.location}!`, client, true);
        }
    }
    embed() {
        let emb = new Discord.RichEmbed();
        // emb.setTitle("Raid Information");
        emb.setTitle(this.poke.display_name + " Raid");
        emb.setColor(0xEE6600).setTimestamp();

        let default_url = "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg"
        if (pokelist[this.poke.id]) {
            // emb.setAuthor("RaiderBot_" + this.poke.name, "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png");
            // emb.setThumbnail("https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png");
            let url_base = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_';
            
            // console.log(url_base + this.poke.img + ".png")
            // emb.setAuthor(this.poke.display_name + " Raid", url_base + this.poke.img + ".png");
            emb.setThumbnail(url_base + this.poke.img + ".png");
        } else {
            emb.setAuthor("RaiderBot", default_url);
            emb.setThumbnail(default_url);
        }
        let str = `**Time: ** ${this.time}
            **Location: **${this.location}\n`;
        if (this.gym != this.location) {
            str += `**Gym: **: ${this.gym}\n`;
        }
        // str += `**Pokemon: **[${this.poke.name}](https://pokemongo.gamepress.gg/raid-boss-counter/${this.poke.name}-raid-counter-guide)
        //     **Total Attendees: **${this.total()}`;
        if (this.poke.form === 'NORMAL') {
            var raid_name = this.poke.name.toUpperCase()
        } else if (['INCARNATE', 'ALTERED'].includes(this.poke.form)) {
            var raid_name = this.poke.name.toUpperCase()
        } else {
            var raid_name = this.poke.name.toUpperCase() + '_' + this.poke.form.toUpperCase() + '_FORM'
        }
        str += `**Pokemon: **[${this.poke.display_name}](https://www.pokebattler.com/raids/${raid_name})
             **Total Attendees: **${this.total()}`;
        //**Links:**`
        emb.addField("Raid " + this.id, str, true);
        emb.addField("Instructions", "#⃣: How many are you bringing?\n❌: leave the raid\n✅: \"Here!\"\n▶: Send start (only the raid's creator)", true);
        //TODO:  Fix listattendees for if the string is too long.
        emb.addField("Attendees:", this.listAttendees() || "None");
        return emb;
    };

    async messageRaid(fwdmessage, client, alert = false) {
        try {
            this.getUniqueChannelList().forEach(async(channel) => {
                let message = await channel.send(`${this.atAttendees()}\n\n${fwdmessage}`);
                message.delete(5 * 60 * 1000); // delete the message after 5 minutes
            });
        } catch (error) {
            console.log(error);
        }
        if (alert) {
            this.attendees.forEach((attendee) => {
                client.users.get(attendee.id).createDM()
                    .then(
                        (dm) => {
                            dm.send(`Message from raid ${this.id} in the ${this.channels.map((botchan) => botchan.channel.toString()).join(", ")} channel(s)`).catch(error => console.log(error));
                        })
                    .catch((error) => console.log(error));
            });
        }
    };



}

module.exports = Raid;


/**
 * A flattened raid object
 * @typedef {object} FlattenedRaid
 * @property {string} id
 * @property {string} time
 * @property {string} location
 * @property {string} gym
 * @property {string} locationComment
 * @property {{id: number, name: string}} poke
 * @property {{id: string}} owner
 * @property {number} expires
 * @property {{channel:string, message:string, type: string}[]} channels
 * @property {{id: string, count: number,  mention:string , here: boolean, username: string}[]} attendees
 */