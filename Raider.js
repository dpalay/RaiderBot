let config = {};


// Check for config file
if (process.argv[2]) {
    let configfile = './' + process.argv[2]
    config = require(configfile);
} else {
    config = require('./tester.json')
    console.error("No config file given.  start with node Raider.js configFileName")
}




//These are the channels that Raider will watch to tag posts with IDs  See https://github.com/dpalay/RaiderBot for more info
const RaidRooms = config.raidChannels
const quietMode = config.quietMode;
const constants = require('./constant.json');

// Set up persistant file storage
const storage = require('node-persist');
storage.initSync({
        dir: config.storageDir,
    })
    /** @type {Array<string>} */
const emojis = constants.emojis;
const Raid = require('./Raid.js');

// Set up discord.js client
const Discord = require('discord.js');
const client = new Discord.Client({});

// Get other libraries
const fuzz = require('fuzzball');

// The list of raids and timers for the raids
/** @type {Discord.Collection<string,Raid>} */
const activeRaids = new Discord.Collection();

const timeOuts = {}; // Parallel object for activeRaids containing the timeout values, since those can't be stored to disk.

/** @type {number} the index for picking the "random" raid id */
let pointer = 0;

/** @type {boolean} flag for whether it has already loaded the existing raids. */
let loaded = false;

/**
 * Generate a new ID of a Raid so that they don't overlap
 * @param {Discord.Collection<string,Raid>} activeRaids The array containing the list of active raid IDs
 * @returns a 2-character ID for a raid. 
 */
function CreateRaidID() {
    let tmp = ""
    do {
        tmp = constants.randomIds[pointer];
        pointer = pointer < constants.randomIds.length ? pointer + 1 : 0;
    } while (activeRaids.get(tmp));
    storage.setItem("pointer", pointer);
    return tmp;
}


let ME = config.id;
const prefix = config.prefix
const prfxLen = prefix.length
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
 * Adds the list of emojis as reactions to a message.
 * @param {Discord.Message} message 
 */
async function addCountReaction(message) {
    for (i in emojis) {
        try {
            console.log(emojis[i])
            await message.react(emojis[i])
        } catch (err) {
            console.error(err);
        }
    }
}

/**
 * Saves a flattened raid object to the disk with enough 
 * information to be able to re-load the raid 
 * if there is a system crash
 * @param {Raid} raid The raid to save to the disk.
 */
activeRaids.saveRaid = async function saveRaid(raid) {
    console.log(`Saving Raid ${raid.id} to disk`);
    try {
        await storage.setItem(raid.id, raid.save(), { ttl: raid.expires });
    } catch (error) {
        console.error(error)
    }
    console.log(raid);
};


/**
 * 
 * @param {string} id 
 * @param {string} time 
 * @param {string} poke 
 * @param {string} location 
 * @param {Discord.User} owner 
 * @param {number} guests 
 */
activeRaids.makeRaid = function makeRaid(id, time, poke, location, owner, guests) {
    let raid = new Raid(id, time, poke, location, owner, guests, id)
    activeRaids.set(id, raid);
    // store the raid to disk)
    activeRaids.saveRaid(raid)
        // set timer to remove the raid 
    timeOuts[raid.id] = setTimeout(() => activeRaids.removeRaid(raid.id), raid.expires - Date.now());
    return raid
}

/**
 * Removes a raid from the active raids and removes it from the disk
 * @param {String} id - ID of the raid to delete
 */
activeRaids.removeRaid = async function removeRaid(id) {
    activeRaids.get(id).channels.forEach(
        //TODO:  Add message deletion here!!
    )
    activeRaids.delete(id);

    await storage.removeItem(id); // remove the raid to disk
    return activeRaids;
}




//Chat commands
//FIXME: help isn't working
//!raider help
function sendHelp(message, parseArray) {
    console.log("sendHelp from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString());
    if (message.content === prefix || message.content === prefix + ' help') {
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
    if (message.channel.type === 'text') {
        message.delete().catch(console.error)
    }
}

//!raider new <time>, <poke>, <location>
//!raider new <time>, ID='<messageID>, gym'
async function sendNew(message, parseArray) {
    console.log("sendNew from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);

    //!raider new
    if (message.content.trim() === prefix + ' new') {
        sendHelp(message, parseArray)
        return;
    }

    //set up variables we'll need
    let options = {};
    let raid = {};
    let msgstart = prfxLen + parseArray[0].length + 2 // length of "!raider new "


    // no comma
    // "!raider new time pokemon a location count" => ["time", "pokemon", "a", "location", "count"]
    // "!raider new id=12321232132?12321232132" => ["id=12321232132?12321232132"]
    if (!(message.content.indexOf(",") >= 0)) {
        parseArray = message.content.substring(msgstart).split(" ")
    } else {
        // with comma
        // "!raider new time, pokemon, a location, count" => ["time", "pokemon","a location", "count"]
        parseArray = message.content.substring(msgstart).split(",").map((m) => {
            return m.trim() //get rid of spaces at beginning or end of each element
        })
    }


    //!raider new time id='somereally?longstring' More Info
    // if there is nothing left after getting rid of "!raider new"
    if (!parseArray[1]) {
        message.channel.send("Sorry, " + message.author + ". I couldn't understand your request.  Perhaps you used the wrong syntax?")
        return;
    }
    //FIXME: Check the time and find the next instance of that time
    raid = activeRaids.makeRaid(CreateRaidID(), parseArray[0], parseArray[1], parseArray[2], message.author, parseArray[3]);
    if (!quietMode) {
        await message.channel.send({
            embed: raid.embed()
        }).then(console.log(`Raid created by ${message.author} in ${message.channel}`));
    }
    message.channel.send("**" + raid.time + "**" + " Raid (" + raid.id + ") created by " + message.author + " for **" +
            raid.poke.name + "** at **" + raid.location + "**" +
            nl + "Others can join this raid by typing `!raider join " + raid.id + "` or by clicking the reaction buttons below")
        .then((message) => {
            raid.addMessage(message.channel, message);
            addCountReaction(message)
        })
        .catch(console.error);
}

//!raider transfer raidID @newperson
/**
 * 
 * @param {Discord.Message} message 
 * @param {string[]} parseArray 
 */
function sendTransfer(message, parseArray) {
    console.log("sendTransfer from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    /** @type {Raid} */
    let r = {};
    let ID = "";
    /** @type {Discord.User} */
    let user = {};
    let msgstart = prfxLen + 10; // " transfer " is 10 chars
    // "!raider transfer 23, @person" => ["23", "@person"]
    parseArray = message.content.substring(msgstart).split(",").map((m) => {
        return m.trim()
    })
    ID = parseArray[0].toUpperCase()
        // check if the raid exists and there was a target
    if (activeRaids.has(ID) && message.mentions.users) {
        // get the raid
        r = activeRaids.get(ID)
            // message author is owner
        if (r.authorized(message, "Message")) {
            user = message.mentions.users.first()
                //set the owner to be the user with the @mention
            if (r.owner.id === user.id) {
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
    if (message.channel.type === 'text') {
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
    if (activeRaids.has(ID)) {
        let r = activeRaids.get(ID)
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
    if (message.channel.type === 'text') {
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
    let msgstart = prfxLen + 8; // " update " is 8 chars
    let tmp = message.content.substring(msgstart).split(" ")
    ID = tmp.shift().toUpperCase();
    ID = ID ? ID.replace(",", "").trim() : "" // in case the shift is undefined

    if (activeRaids.has(ID)) {
        let r = activeRaids.get(ID)

        // Get the command
        let cmd = tmp.shift();
        cmd = cmd ? cmd.replace(",", "").trim() : "";
        // if it's "count" or a number, then they don't need to have security, they just need to be in the raid
        if (cmd === "count" || parseInt(cmd)) {
            if (cmd === "count") {
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
                            message.reply(" removed from raid " + ID + nl + "Total confirmed is: " + activeRaids.get(ID).total())
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
                    timeOuts[r.id] = setTimeout(() => activeRaids.removeRaid(r.id), r.expires - Date.now())
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
                        timeOuts[r.id] = setTimeout(() => activeRaids.removeRaid(r.id), r.expires - Date.now())
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
    if (message.channel.type === 'text') {
        message.delete().catch(console.error)
    }

}

function sendInfo(message, parseArray) {
    console.log("sendInfo from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString())
    if (parseArray[1]) {
        let ID = parseArray[1].toUpperCase();
        let raid = {};
        if (activeRaids.has(ID)) {
            raid = activeRaids.get(ID);
            console.log("attempting to send info for " + ID)
                //   message.reply(raid.toString());
            message.channel.send({
                embed: raid.embed()
            }).then(console.log(`Raid ${ID} information sent to ${message.author.username} in #${message.channel}`)).catch((err) => console.error(`Raid ${ID} info not sent! ${err}`));
        } else {
            message.reply(`Couldn't find Raid ${ID}.`)
        }
    } else {
        message.reply("No raid found")
    }
    if (message.channel.type === 'text') {
        message.delete().catch(console.error)
    }
}


/* Sends a message to the whole raid.
 * @example !raider message RaidID, [Everything else goes, here]
 * 
 */

function sendAtMessage(message, parseArray) {
    console.log("sendMessage from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    //if there's a RaidID
    if (parseArray[1]) {
        // handle the comma after RaidID
        if (parseArray[1].trim().search(",") >= 0) {
            parseArray[1] = parseArray[1].split(",")[0];
        }
        let ID = parseArray[1].toUpperCase();
        let user = message.author;
        //if Raid exists.
        if (activeRaids.has(ID)) {
            let raid = activeRaids.get(ID);
            if (userInRaid(user, raid) || message.author.id === '218550507659067392') {
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


//!raider kick raidID @user
function sendKick(message, parseArray) {
    let ID = ""
    if (parseArray[1]) {
        ID = parseArray[1].toUpperCase()
        let raid = activeRaids.get(ID)
        if (raid.authorized(message, "Message")) {
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




//admin command
function sendSpecial(message, parseArray) {
    if (message.author.id === '218550507659067392') {
        if (parseArray[2]) {
            let options = {
                scorer: fuzz.token_set_ratio
            };
            let match = [fuzz.extract(parseArray[2], names, options)[0], fuzz.extract(parseArray[2], names, options)[1], fuzz.extract(parseArray[2], names, options)[2]]
            message.reply(match)
        }
    }
}




client.on('messageReactionAdd', async(messageReaction, user) => {
    //TODO: Better logic.  The author shouldn't just be Raider, the message should be a raid message
    if (user !== ME && messageReaction.message.author === ME) {
        console.log(`${user.username} added a reaction of ${messageReaction.emoji.name} to ${messageReaction.message.content}`)
        let id = messageReaction.message.content.match(/Raid \((.*)\)/)[1]
        let raid = activeRaids.get(id)
        switch (messageReaction.emoji.name) {
            case "❌":
                raid.removeFromRaid(user)
                break;
            case "1⃣":
            case "2⃣":
            case "3⃣":
            case "4⃣":
            case "5⃣":
                // add user to the raid
                raid.addUserToRaid(user, emojis.indexOf(messageReaction.emoji))
                break;
            case "✔":
                //TODO:  move this to the raid / attendee objects
                raid.attendees.get(user.id).here = true;
                break;
            case "▶":
                raid.messageRaid(messageReaction.message.channel, `${user} has started the raid!`, client)
                break;
        }
        await activeRaids.saveRaid(raid);
        messageReaction.remove(user).then((messageReaction) => {
            console.log(`removed ${user.username}'s reaction`)
                //messageReaction.message.edit(messageReaction.message.content + "\n\t" + user.username + ": " + messageReaction.emoji.name)
        })
    }


})


//When a message is posted
client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(prefix.toLowerCase()) !== 0) return;


    // This is the best way to define args. Trust me.
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    /*
        // The list of if/else is replaced with those simple 2 lines:
        try {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run(client, message, args);
        } catch (err) {
            console.error(err);
        }
    });
    */


    // get the commands
    let parseArray = message.content.substring(prefix.length).trim().split(" ");
    //handling synonyms
    switch (command) {
        //Things that mean terminate
        case "inactivate":
        case "kill":
        case "destroy":
        case "delete":
            command = "terminate";
            break;
            //things that mean new
        case "make":
        case "create":
            command = "new";
            break;
        case "change":
        case "alter":
            command = "update";
            break;
    }
    switch (command) {
        //New Raid
        case "new":
            sendNew(message, parseArray);
            break;

            //Give ownership to someone else
        case "transfer":
            sendTransfer(message, parseArray);
            break;

            //Add self to the raid
            // case "join":
            //  sendJoin(message, parseArray);
            //   break;

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

        case "join":
        case "terminate":
        case "list":
        case "myraids":
        case "kick":
            let runcommand = require(`./Commands/${command}.js`)
            runcommand.run(client, message, activeRaids, parseArray);
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

});



if (config.debug) {
    client.on("error", (e) => console.error(e));
    client.on("warn", (e) => console.warn(e));
    client.on("debug", (e) => console.info(e));
} else {
    //Comment this out if you are not using pm2 and keymetrics.io.  But really, why aren't you using them?  They're awesome!
    // Set up Metric for Keymetrics.io
    let probe = require('pmx').probe()

    let numRaids = probe.metric({
        name: "# of raids",
        value: () => activeRaids.size
    });
}



// Connected!
client.on('ready', async() => {
    client.user.setActivity(prefix + ' help | More info')
    ME = client.user
    console.log("Loading saved Raids")
        // load the stored raids into memory
    if (!loaded) {
        storage.forEach(async(key, val) => {
            if (key === "pointer") {
                pointer == val
            } else {
                if (val.expires <= Date.now()) {
                    await storage.removeItem(key); // remove the raid to disk
                } else {
                    let owner = await client.fetchUser(val.owner.id);
                    let raid = new Raid(key, val.time, val.poke.id, val.location, owner, val.owner.count)
                    raid.gym = val.gym;
                    raid.locationComment = val.locationComment
                    raid.expires = val.expires
                    val.attendees.forEach((att) => {
                        raid.addUserToRaid(att, att.count);
                    })
                    timeOuts[raid.id] = setTimeout(() => activeRaids.removeRaid(raid.id), raid.expires - Date.now())
                    await Promise.all(raid.channels.map((chanMess) => {
                        client.channels.get(chanMess[0]).fetchMessage(chanMess[1])
                    }))
                    activeRaids.set(key, raid);
                }
            }
        });
    }
    loaded = true;
    console.log('Raider is ready!');
});


console.log("Logging in!");
// connect
client.login(config.token);