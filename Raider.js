// Change the last section of the next line to be the name listed in your config.json file
const config = require('./config.json').raider;
//These are the channels that Raider will watch to tag posts with IDs  See https://github.com/dpalay/RaiderBot for more info
const RaidRooms = require('./config.json').raidChannels
const quietMode = require('./config.json').quietMode;
const constants = require('./constant.json');
// Set up persistant file storage
const storage = require('node-persist');
storage.initSync({
    dir: config.storageDir,
})

// Set up discord.js client
const Discord = require('discord.js');
const client = new Discord.Client({
    autoReconnect: true
});

// Get other libraries
const _ = require('underscore');
const fuzz = require('fuzzball');
const bigInt = require('big-integer');

// The list of raids and timers for the raids
const activeRaids = {};
const timeOuts = {}; // Parallel object for activeRaids containing the timeout values, since those can't be stored to disk.


let ME = config.id;
const prefix = config.prefix
const prfxLen = prefix.length

const ALPHANUM = constants.alphanum;
const names = constants.pokelist;

// Formatting shortcuts
const newline = "\n";
const nl = newline;
const tab = "\t";

// Constant Embeds
const helpembed = new Discord.RichEmbed().setTitle("Raider Bot Help Information!")
helpembed.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.setDescription("These are the commands available to help organize raids:")
helpembed.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.addField("New", "\tCreates a new raid for others to join.\n\t**Syntax**: `!raider new <time>, <pokemon>, <location> [, <# of people you're bringing>]`\n\t**Example**: `!raider new 3:30, Articuno, Gym on Main St., 3`" +
    nl + nl + tab + "**Alternate Syntax**: `!raider new <time>, <RAID_ID_FROM_MESSAGE>, <Gym>`" +
    nl + tab + "**Example:** `raider new 3:00, ID=352935634740183040?342054368733822977, Metal Birds`")
helpembed.addField("Join", "\tJoins an existing raid, listing how many people are in your party.\n\t**Syntax**: `!raider join <RaidID> [, <# of people you're bringing>]`\n\t**Example**: `!raider join 32, 3`")
helpembed.addField("Leave", "\tLeaves a raid, removing you and anyone you're bringing.\n\t**Syntax**: `!raider leave <RaidID>`\n\t**Example**: `!raider leave 42`")
helpembed.addField("Update", "\tChanges the count of people you're bringing.\n\t**Syntax**: `!raider update <RaidID>, <new # of people>`\n\t**Example**: `!raider update 23, 3`\n\nUpdate can also make other changes to a raid. Try `!raider help update` for more information")
helpembed.addField("Info", "\tProvides information about a raid in a neat little message.\n\t**Syntax**: `!raider info <RaidID>`\n\t**Example**: `!raider info 58`")
helpembed.addField("List", "\tLists all the active Raids.\n\t**Syntax**: `!raider list`")
helpembed.addField("Merge", "\tMerges two existing raids, copying the users from one to another.**_You must be the owner of the from raid_**\n\t**Syntax**: `!raider merge <From Raid ID>, <To Raid ID>`\n\t**Example**: `!raider merge 33, 17`")
helpembed.addField("Transfer", "\tTransfers ownership of a raid. **_You must be the owner to grant ownership to someone else._**\n\t**Syntax**: `!raider transfer <RaidID>, <@new Owner>`\n\t**Example**: `!raider transfer 23, @Thanda`")
helpembed.addField("Inactivate", "\tInactivates (deletes) a raid. **_You must be the owner of the raid to inactivate it._**\n\t**Syntax**: `!raider inactivate <RaidID>`\n\t**Example**: `!raider inactivate 4C`")

// Helper functions

/**
 * Stores the raid to the disk.  Called any time the raid object is modified
 * @param raid 
 */
function storeRaid(raid) {
    storage.setItemSync(raid.id, raid, {
            ttl: raid.expires
        }) // store the raid to disk
}

/**
 * Checks if the user owns the raid (or is me).  Used in things like transfering, merging, and inactivating raids
 */
function authorized(raid, message) {
    return (raid.owner.id == message.author.id || message.author.id == '218550507659067392') // Admin :)
}

/**
 * Generate a new ID of a Raid so that they don't overlap
 */
function getRaidID() {
    let tmp = ""
    do {
        tmp = Math.floor(Math.random() * 9 + 1) + ALPHANUM[Math.floor(Math.random() * 33)]
    } while (activeRaids[tmp] && tmp != '69')
    return tmp;
}

/**
 * Removes a raid from the active raids
 * @param {*} id - ID of the raid to delete
 */
function clearRaidID(id) {
    delete activeRaids[id];
    storage.removeItemSync(id); // remove the raid to disk
    return activeRaids;
}

/**
 * WHO'S THAT POKEMON!?
 * Function to try to guess which pokemon the user is trying to type in
 * @param {*} poke - the user's input.  Can be #111, 111, or text
 * @returns the ID of the pokemon they typed in
 */
function interpretPoke(poke) {
    console.log("==INTERPRET POKEMON:  " + poke + "==")
    let pokeID = 0;
    if (poke == 'ttar') {
        poke = "tyranitaur";
        console.log("==\twas ttar, now tyranitaur")
    }
    if (poke.toString().startsWith("#")) {
        console.log("==\tStarted with #")
        pokeID = parseInt(poke.substring(1));
    } else if (parseInt(poke) >= 0) {
        console.log("==\tStarted with a number greater than 0")
        pokeID = parseInt(poke)
    } else {
        console.log("==\tBegin fuzzy search")
        let options = {
            scorer: fuzz.token_set_ratio
        };
        let match = fuzz.extract(poke, names, options)[0]
        console.log("==\t" + match)
        if (match[1] >= 85) { // pretty sure we figured it out
            console.log("==\tHigh Enough Score")
            pokeID = match[2] + 1; //index, but Pokemon start at a non-zero index (Bulbasaur = 1, not 0)
        } else {
            console.log("&&\tNo idea.  returning what we started with.")
            pokeID = poke;
        }
    }
    return pokeID;
}

function userInRaid(user, raid) {
    return _.find(raid.attendees, (attendee) => {
        return attendee.id == user.id;
    })
}


// Objects
/** Attendee object */
function attendee(userID, username, mention, count = 1) {
    this.id = userID;
    this.username = username;
    this.mention = mention;
    this.count = count;
    this.toString = function() {
        return mention
    };
}

/** Raid object */
function raid(time, poke, location, owner, guests = 1, idOverride = undefined) {
    let tmpuser = new attendee(owner.id, owner.username, owner.toString(), guests)
    this.id = idOverride || getRaidID();
    this.time = time;
    this.location = location;
    this.gym = location;
    this.locationComment = "";
    this.poke = {}
    this.poke.id = interpretPoke(poke);
    this.poke.name = names[this.poke.id - 1] ? names[this.poke.id - 1] : poke;
    this.owner = tmpuser;
    this.expires = this.poke.id != '150' ? Date.now() + 7200000 : Date.now() + 36000000; //TODO: better expiration
    this.channels = {}
    this.attendees = {};
    //  this.potential = {};  //TODO:  "Maybe" a raid; potentially joining
    //  this.comments = {};   //TODO:  Add in a way for users to add comments to the raid
    this.attendees[owner.id] = tmpuser


    // Add this raid to the active raids
    activeRaids[this.id] = this;

    // functions
    /**
     * raid.total() returns the total number of people planning on showing up to the raid
     */
    this.total = function() {
        let sum = 0;
        _.each(this.attendees, (attendee) => {
            sum = +sum + +attendee.count;
        })
        return sum;
    };

    /**
     * Prints out the various values for the raid.
     */
    this.toString = function() {
        let str = ""
        str += "Raid ID: " + this.id + nl;
        str += tab + "Time: " + this.time + nl;
        str += tab + "Pokemon: #" + this.poke.id + " " + this.poke.name + nl;
        str += tab + "Location: " + this.location + nl;
        str += tab + "Organizer: " + this.owner + nl;
        str += tab + "Confirmed attendees: " + nl;
        _.each(this.attendees, (attendee) => {
            str += tab + tab + attendee.count + tab + " - " + attendee + nl;
        })
        return str;
    }

    /** returns the @mentions of all the attendees as a string. */
    this.listAttendees = function() {
        let str = "";
        _.each(this.attendees, (attendee) => {
            str += tab + tab + attendee.count + tab + " - " + attendee.username + " - " + attendee.mention + nl;
        });
        return str;
    }

    this.atAttendees = function() {
        let str = "";
        _.each(this.attendees, (attendee) => {
            str += attendee.mention + ", ";
        });
        str.substr(0, str.length - 2);
        return str;
    }

    /** Creates an Embed object for this raid */
    this.embed = function() {
        let emb = new Discord.RichEmbed();
        emb.setTitle("Raid Information");
        emb.setColor(0xEE6600).setTimestamp();
        if (names[this.poke.id]) {
            emb.setAuthor("RaiderBot_" + this.poke.name, "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
            emb.setThumbnail("https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
        } else {
            emb.setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
            emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
        }
        let str = "**Time: **" + this.time + nl +
            "**Location: **" + this.location + nl
        if (this.gym != this.location) {
            str += "**Gym: **: " + this.gym + nl
        }
        str += "**Pokemon: **#" + this.poke.id + " " + this.poke.name + nl +
            "Self-destructs at: " + new Date(this.expires).toLocaleTimeString() + nl +
            "**Total Attendees: **" + this.total() + nl +
            "**Attendee List:**" + nl + this.listAttendees()

        emb.addField("Raid " + this.id, str);

        return emb;
    }

    this.messageRaid = function(channel, fwdmessage) {
        _.each(this.attendees, (attendee) => {
            client.users.get(attendee.id).createDM().then((dm) => {
                dm.send("Message from one of your raids in the " + channel + " channel")
            })

        })
        channel.send(this.atAttendees() + nl + fwdmessage).then(
            console.log(tab + tab + fwdmessage)
        )
    };

}

// add a user to the raid
function addToRaid(id, user, count = 1) {
    let raid = activeRaids[id]
    if (raid.attendees[user.id])
        return false; // already existed
    raid.attendees[user.id] = new attendee(user.id, user.username, user.toString(), count)
    return true; //successful
}

// Removes the user from the raid
function removeFromRaid(raid, user) {
    delete raid.attendees[user.id]
    return true;
}

//Chat commands
//FIXME: help isn't working
//!raider help
function sendHelp(message, parseArray) {
    console.log("sendHelp from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString());
    if (message.content == prefix || message.content == prefix + ' help') {
        message.author.createDM().then(
            (dm) => {
                dm.send({
                    embed: helpembed
                });
            }
        );
    } else if (parseArray[2]) {

        switch (parseArray[2].toLowerCase()) {
            case "new":
            case "join":
            case "leave":
            case "merge":
            case "update":

            case "info":
            case "list":
            default:
                message.reply({
                    embed: helpembed
                })
                message.channel.send("Please note that the Merge command is not yet active.")
                message.channel.send("The owner of a raid can also destroy it with the command `!raider inactivate <Raid ID>`.")
                break;
        }
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider new <time>, <poke>, <location>
//!raider new <time>, ID='<messageID>, gym'
function sendNew(message, parseArray) {
    console.log("sendNew from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);

    if (message.content.trim() == prefix + ' new') {
        sendHelp(message, parseArray)
        return;
    }

    let options = {};
    let r = {};
    let returnFlag = false;


    // no comma
    // "!raider new time pokemon a location count" => ["time", "pokemon", "a", "location", "count"]
    // "!raider new id=12321232132?12321232132" => ["id=12321232132?12321232132"]
    if (!(message.content.indexOf(",") >= 0)) {
        parseArray = message.content.substring(12).split(" ")
    } else {
        // with comma
        // "!raider new time pokemon a location count" => ["time", "pokemon","a", "location", "count"]
        parseArray = message.content.substring(12).split(",").map((m) => {
            return m.trim()
        })
    }

    //!raider new time id='somereally?longstring' More Info
    if (!parseArray[1]) {
        message.channel.send("Sorry, " + message.author + ". I couldn't understand your request.  Perhaps you used the wrong syntax?")
        return;
    }

    if (parseArray[0].indexOf("=") >= 0 && parseArray[0].indexOf("?") >= 0) {
        message.channel.send("Sorry, " + message.author + ". It looks like you didn't have a time before your ID=.  Try creating the raid again? The syntax is `!raider new <time>, ID=<copied raid ID>`")
    } else if (parseArray[1].indexOf("=") >= 0) {
        options.time = parseArray.shift();
        options.msgChan = parseArray.shift();
        if (!options.msgChan.includes('?')) {
            message.channel.send("Sorry, " + message.author + ". I couldn't understand your request.  Perhaps you used the wrong syntax?  There should have been a ? in the ID somewhere.  Did you copy from the Raid Posting?")
            return
        }
        let msgChan = options.msgChan.split("?");
        msgChan[0] = bigInt(msgChan[0].substr(3), 36).toString();
        msgChan[1] = bigInt(msgChan[1], 36).toString();
        options.gym = parseArray.join(" ");

        // go find the message
        if (client.channels.get(msgChan[1])) {

            client.channels.get(msgChan[1]).fetchMessage(msgChan[0]).then((msg) => {
                // console.log(message);

                // set the options for the new raid(time, poke, location, owner, count)
                options.poke = msg.embeds[0].description.split(" ")[0] // gets the #123
                options.location = "[" + msg.embeds[0].title + "](" + msg.embeds[0].url + ")"



                // Call the new raid
                r = new raid(options.time, options.poke, options.location, message.author);
                if (options.gym) {
                    r.gym = options.gym;
                }


                //Let them know the raid is created.

                if (quietMode) {

                    message.channel.send("**" + r.time + "**" + " Raid (" + r.id + ") created by " + message.author + " for **" +
                        r.poke.name + "** at **" + r.location.slice(1, r.location.indexOf("]")) + "**" +
                        //nl +/"**Map link**: " + r.location.substr(r.location.indexOf("]"+1)) + 
                        nl + "Others can join this raid by typing `!raider join " + r.id + "`");
                } else {
                    message.channel.send({
                        embed: r.embed()
                    });
                }

                //message.channel.send("Others can join this raid by typing `!raider join " + r.id + "`").then(() => console.log("Raid Created"));
                // remove raid in 2 hours
                timeOuts[r.id] = setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
                storeRaid(r); //save raid to disk
            }).catch(() => {
                console.error
                returnFlag = true;
            })

        } else {
            message.channel.send("Sorry, " + message.author + ". I couldn't find a Raid posting with that ID.  Perhaps you used the wrong syntax?")
        }
        //let raidMessage = // get the message id.trim()
        // get the Raid posting
        // get the pokemon and the gym (with link!)
    } else {


        //FIXME: Check the time and find the next instance of that time
        // raid(time, pokemon, location, owner, count)
        if (quietMode) {

            message.channel.send("**" + r.time + "**" + " Raid (" + r.id + ") created by " + message.author + " for **" +
                r.poke.name + "** at **" + r.location.slice(1, r.location.indexOf("]")) + "**" +
                //nl +/"**Map link**: " + r.location.substr(r.location.indexOf("]"+1)) + 
                nl + "Others can join this raid by typing `!raider join " + r.id + "`");
        } else {
            message.channel.send({
                embed: r.embed()
            });
        } // remove raid in 2 hours
        timeOuts[r.id] = setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
        storeRaid(r); // Save raid to disk
    }
}

//!raider transfer raidID @newperson
function sendTransfer(message, parseArray) {
    console.log("sendTransfer from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let r = {}
    let ID = ""
    let user = {}
        // "!raider transfer 23, @person" => ["23", "@person"]
    parseArray = message.content.substring(17).split(",").map((m) => {
        return m.trim()
    })
    ID = parseArray[0].toUpperCase()
        // check if the raid exists and there was a target
    if (activeRaids[ID] && message.mentions.users) {
        // get the raid
        r = activeRaids[ID]
            // message author is owner
        if (authorized(r, message)) {
            user = message.mentions.users.first()
                //set the owner to be the user with the @mention
            if (r.owner == user) {
                message.reply("you already own this raid. Did you want to give it to someone else?")
            } else {
                r.owner = user;
                storeRaid(r); // store the raid to disk
                message.reply("Set " + user + " as the owner of raid " + ID)
            }
        } else {
            message.reply(": you don't have permission to give away Raid " + ID)
        }
    } else {
        message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider join raidID
function sendJoin(message, parseArray) {
    console.log("sendJoin from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let ID = ""
    let count = 0;
    //"!raider join ##, 3" => ["##", "3"]
    parseArray = message.content.substring(13).split(",").map((m) => {
        return m.trim()
    })
    ID = parseArray[0].toUpperCase();
    count = parseInt(parseArray[1]) ? parseInt(parseArray[1]) : 1;
    console.log("\tID: " + ID + "\tcount: " + count + "\tparseArray: " + parseArray)
    if (count >= 0) {
        // does raid exist
        if (activeRaids[ID]) {
            // try to add user to the raid
            let r = activeRaids[ID];
            if (addToRaid(ID, message.author, count)) {
                message.reply(" added to raid " + ID + " owned by " + r.owner +
                    "  Total confirmed is: **" + r.total() + "**");
                storeRaid(r); // store the raid to disk

            } else {
                message.reply("You are already added to the raid. To remove yourself, type `!raider leave " + ID + "` to change the number of players you're bringing, use `!raider update " + ID + ", <new #>`")
            }
        }
        //raid doesn't exist
        else {
            message.reply("Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
        }
    } else {
        message.reply("this wasn't a positive number I could recognize.  Try again?");
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider leave RaidID
function sendLeave(message, parseArray) {
    console.log("sendLeave from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    // "!raider leave ##"
    let ID = parseArray[2].toUpperCase();
    //if raid exists
    if (activeRaids[ID]) {
        let r = activeRaids[ID]
            // try to remove user to the raid
        if (removeFromRaid(r, message.author)) {
            message.reply(" removed from raid " + ID + " **Total confirmed is: " + r.total() + "**")
            storeRaid(r) // store the raid to disk
        } else {
            message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendLeave() function")
        }
    }
    //raid doesn't exist
    else {
        message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids.")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}


// let message1 = {content: "!raider update ID, #"}
// let message2 = {content: "!raider update ID, count, #"}
// let message3 = {content: "!raider update ID, poke, new poke"}
// let message4 = {content: "!raider update ID, pokemon, new poke"}
// let message5 = {content: "!raider update ID, time, new time"}
// let message6 = {content: "!raider update ID, gym, Gym name"}
// let message7 = {content: "!raider update ID, location, some location place"}
function sendUpdate(message, parseArray) {
    console.log("sendUpdate from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let ID = ""
    let count = ""

    // Get the ID
    let tmp = message.content.substring(15).split(" ")
    ID = tmp.shift().toUpperCase();
    ID = ID ? ID.replace(",", "").trim() : "" // in case the shift is undefined

    if (activeRaids[ID]) {
        let r = activeRaids[ID]

        // Get the command
        let cmd = tmp.shift();
        cmd = cmd ? cmd.replace(",", "").trim() : "";
        // if it's "count" or a number, then they don't need to have security, they just need to be in the raid
        if (cmd == "count" || parseInt(cmd)) {
            if (cmd == "count") {
                count = tmp.shift();
                count = count.replace(",", "").trim();
            } else {
                count = parseInt(cmd);
            }
            if (parseInt(count) >= 0) {

                if (r.attendees[message.author.id]) { // If the user is in the raid
                    if (count == 0) {
                        if (removeFromRaid(r, message.author)) {
                            storeRaid(r);
                            message.reply(" removed from raid " + ID + nl + "Total confirmed is: " + activeRaids[ID].total())
                        } else {
                            message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendUpdate() function")
                        }
                    } else {
                        r.attendees[message.author.id].count = count;
                        message.reply("Updated total for the raid is now " + r.total())
                        storeRaid(r);
                    }
                } else {
                    message.reply("You aren't in this raid.  If you'd like to be, try `!raider join " + ID + "`")
                }
            } else {
                message.reply("I couldn't figure out how many people you're trying to bring.  What number is `" + count + "`")
            }
        } else if (authorized(r, message)) {
            switch (cmd) {
                case "poke":
                case "pokemon":
                    let poke = tmp.shift()
                    poke = poke ? poke.replace(",", "").trim() : "1";
                    r.poke.id = interpretPoke(poke);
                    r.poke.name = names[r.poke.id - 1] ? names[r.poke.id - 1] : poke;
                    console.log(tab + "Updating Pokemon to " + r.poke.name)
                    r.messageRaid(message.channel, "The Pokemon for raid " + ID + " has been update to " + r.poke.name)
                    break;
                case "time":
                    clearTimeout(timeOuts[r.id]);
                    let time = tmp.shift();
                    time = time ? time.replace(",", "").trim() : r.time;
                    r.time = time;
                    r.expires = r.poke.id != '150' ? Date.now() + 7200000 : Date.now() + 36000000; //TODO: better expiration
                    timeOuts[r.id] = setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
                    console.log(tab + "Updated Time to " + r.time)
                    r.messageRaid(message.channel, "The time for raid " + ID + " has been updated to " + r.time)
                    break;
                case "gym":
                    r.gym = tmp.join(" ");
                    console.log(tab + "Updated Gym to " + r.gym)
                    r.messageRaid(message.channel, "The gym for raid " + ID + " has been updated to " + r.gym)
                    break;
                case "location":
                    r.location = tmp.join(" ");
                    console.log(tab + "Updated location to " + r.location)
                    r.messageRaid(message.channel, "The location for raid " + ID + " has been updated to " + r.location)
                    break;
                case "expire":
                case "expiration":
                case "expires":
                case "timer":

                    let expires = tmp.shift();
                    if (parseInt(expires)) {
                        clearTimeout(timeOuts[r.id]);
                        r.expires = Date.now() + parseInt(expires) * 60 * 1000;
                        timeOuts[r.id] = setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
                    }
                    break;
                default:
                    break;
            }
            storeRaid(r);
        } else {
            // No Raid with that ID found.
            message.author.createDM().then((dm) => {
                dm.send("Sorry, I couldn't process the command.\nType `!raider list` for a list of active raids and `!raider help` for a list of commands.\nYou typed `" + message + "`")
            }).catch(console.error)
        }

    } else {
        // No Raid with that ID found.
        message.author.createDM().then((dm) => {
            dm.send("Either that raid doesn't exist, or I couldn't process the command.\nType `!raider list` for a list of active raids and `!raider help` for a list of commands.\nYou typed `" + message + "`")
        }).catch(console.error)
    }

    // Clear out the message the user typed to Raider
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }

}

function sendInfo(message, parseArray) {
    console.log("sendInfo from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString())
    if (parseArray[2]) {
        let ID = parseArray[2].toUpperCase();
        let raid = {};
        if (activeRaids[ID]) {
            raid = activeRaids[ID];
            console.log("attempting to send info for " + ID)
                //   message.reply(raid.toString());
            message.channel.send({
                embed: raid.embed()
            });
        } else {
            message.reply("Couldn't find raid " + ID + ".")
        }
    } else {
        message.reply("No raid found")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}


/** Sends a message to the whole raid.
 * @example !raider message RaidID, [Everything else goes, here]
 */
function sendAtMessage(message, parseArray) {
    console.log("sendMessage from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    //if there's a RaidID
    if (parseArray[2]) {
        // handle the comma after RaidID
        if (parseArray[2].trim().search(",") >= 0) {
            parseArray[2] = parseArray[2].split(",")[0];
        }
        let ID = parseArray[2].toUpperCase();
        let user = message.author;
        //if Raid exists.
        if (activeRaids[ID]) {
            let raid = activeRaids[ID];
            if (userInRaid(user, raid) || message.author.id == '218550507659067392') {
                let fwdmessage = message.content.substr(message.content.indexOf(",") + 1).trim();
                raid.messageRaid(message.channel, fwdmessage);
            } else {
                message.author.createDM().then(
                    (dm) => {
                        dm.send("You're not in the raid that you tried to send a message to. Please try again.  `!raider message <Raid ID>, your message here");
                    }
                );
            }
        } else {
            message.reply("Couldn't find raid with an ID of " + ID + ". Try `!raider list` for a list of active raids");
        }
    } else {
        message.reply("I couldn't understand your request. Try again with `!raider send <RaidID>, Message`");
    }
}

/** Sends the list of raids to the user who requested.
 * @example !raider list 
 */
function sendList(message, parseArray) {
    console.log("sendList from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let emb = new Discord.RichEmbed();
    emb.setTitle("Active Raids!")
    emb.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
    emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
    if (_.size(activeRaids) == 0) {
        emb.setDescription("There are no currently active raids.\nTry `!raider new <time>, <poke>, <location>` to start a new one.");
        //message.reply({embed: emb});
    } else {
        emb.setDescription("These are the currently active raids:")
        _.each(activeRaids, (raid) => {
            emb.addField(raid.id, tab + "**Owner: ** " + raid.owner.mention + nl +
                "**Time: **" + raid.time + nl +
                "**Location: **" + raid.location + nl +
                "**Pokemon: **#" + raid.poke.id + " " + raid.poke.name + nl +
                "**Attendees: **" + raid.total() + nl +
                "`!raider info " + raid.id + "`", true);
        })
    }
    //message.reply({embed: emb});
    message.author.createDM().then(
        (dm) => {
            dm.send({
                embed: emb
            });
        }
    );
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}


//!raider kick raidID @user
function sendKick(message, parseArray) {
    let ID = ""
    if (parseArray[2]) {
        let r = activeRaids[ID]
        if (authorized(r, message)) {
            if (message.mentions.users.length > 0) {
                for (let i = 0; i < message.mentions.users.length; i++) {
                    removeFromRaid(r, message.mentions.users[i]);
                }
                storeRaid(r); // store the raid to disk
                message.reply("Users have been removed from the raid. **Total confirmed is: " + r.total() + "**")
            } else {
                message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid kick <Raid ID> @user`")
            }
        } else {
            message.reply("You must be the owner of a raid to kick someone from it.")
        }
    } else {
        message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid kick <Raid ID> @user`")
    }
}


//!raider kill raidID
function sendTerminate(message, parseArray) {
    if (parseArray[2]) {
        let ID = parseArray[2].toUpperCase();
        if (activeRaids[ID] && authorized(activeRaids[ID], message)) {
            let r = activeRaids[ID];
            console.log("attempting to destroy info for " + ID)
            sendInfo(message, parseArray);
            clearRaidID(r.id); // clears the raid and removes from disk
            message.reply("Raid " + ID + " destroyed.  Thank you for using Raider!");
        } else {
            message.reply("Either the raid doesn't exist, or you're not the owner.")
        }
    } else {
        message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid terminate <Raid ID>`")
    }
}

//sends list of raids to the user
function sendMyRaids(message, parseArray) {
    message.author.createDM().then((dm) => {
        _.each(activeRaids, (raid) => {
            if (userInRaid(message.author, raid)) {
                dm.send({
                    embed: raid.embed()
                })
            }
        })
    })
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//admin command
function sendSpecial(message, parseArray) {
    if (message.author.id == '218550507659067392') {
        if (parseArray[2]) {
            let options = {
                scorer: fuzz.token_set_ratio
            };
            let match = [fuzz.extract(parseArray[2], names, options)[0], fuzz.extract(parseArray[2], names, options)[1], fuzz.extract(parseArray[2], names, options)[2]]
            message.reply(match)
        }
    }
}



// Connected!
client.on('ready', () => {
    console.log('Raider is ready!');
    client.user.setGame(prefix + ' help | More info')
    ME = client.user
});


//When a message is posted
client.on('message', message => {
    if (message.author.id != ME.id) { // logger shouldn't check it's own stuff)

        // If message is from one of the RaidRooms and comes from a webhook
        if (_.find(RaidRooms, (room) => {
                return message.channel.id == room;
            }) && message.author.discriminator == '0000') {
            message.channel.send("ID=" + bigInt(message.id).toString(36) + "?" + bigInt(message.channel.id).toString(36))
        } else if (message.content === 'pingg') {
            message.author.createDM().then(
                (dm) => {
                    dm.send("pongg");
                }
            );
        }


        //is it a command?
        else
        if (message.content.toLowerCase().startsWith(prefix)) {
            // get the commands
            let parseArray = message.content.split(" ");
            if (parseArray.length == 1) {
                // Just !raider.  DM Help Info
                sendHelp(message, parseArray);
            } else {
                switch (parseArray[1].toLowerCase()) {
                    //New Raid
                    case "new":
                        sendNew(message, parseArray);
                        break;

                        //Give ownership to someone else
                    case "transfer":
                        sendTransfer(message, parseArray);
                        break;

                        //Add self to the raid
                    case "join":
                        sendJoin(message, parseArray);
                        break;

                        // Leave the raid 
                    case "remove":
                    case "leave":
                        sendLeave(message, parseArray);
                        break;

                        // update how many people are going
                    case "change":
                    case "update":
                        sendUpdate(message, parseArray);
                        break;

                        // get info about raid
                    case "info":
                        sendInfo(message, parseArray);
                        break;

                        // Merge two raids
                    case "merge":
                        message.reply("This command isn't implemented yet.  Sorry!");
                        break;

                        // Inactivate a raid
                    case "terminate":
                    case "inactivate":
                    case "kill":
                        sendTerminate(message, parseArray);
                        break;

                        // List active raids
                    case "list":
                        sendList(message, parseArray);
                        break;

                    case "myraids":
                        sendMyRaids(message, parseArray);
                        break;

                    case "kick":
                        sendKick(message, parseArray);
                        break;

                    case "message":
                        sendAtMessage(message, parseArray);
                        break;

                        // Ask for help
                    case "help":
                        sendHelp(message, parseArray);
                        break;
                    case "special":
                        sendSpecial(message, parseArray);
                        break;
                    default:
                        break;
                }
            }
        }
    }
});

//Comment this out if you are not using pm2 and keymetrics.io.  But really, why aren't you using them?  They're awesome!
// Set up Metric for Keymetrics.io
let probe = require('pmx').probe()

let numRaids = probe.metric({
    name: "# of raids",
    value: () => _.size(activeRaids)
});



console.log("Loading saved Raids")
    // load the stored raids into memory
storage.forEach((k, v) => {
    if (v.expires <= Date.now()) {
        storage.removeItemSync(k); // remove the raid to disk
    } else {

        activeRaids[k] = new raid(v.time, v.poke.id, v.location, v.owner, v.owner.count, v.id);
        activeRaids[k].gym = v.gym;
        activeRaids[k].locationComment = v.locationComment
        activeRaids[k].expires = v.expires
        activeRaids[k].owner = v.owner
        activeRaids[k].attendees = {}
        _.each(v.attendees, (att) => {
            activeRaids[k].attendees[att.id] = new attendee(att.id, att.username, att.mention, att.count)
        })
        timeOuts[activeRaids[k].id] = setTimeout(() => clearRaidID(activeRaids[k].id), activeRaids[k].expires - Date.now())
    }
});
console.log("Logging in!")
    // connect
client.login(config.token)