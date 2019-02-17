const Discord = require('discord.js')
const Raid = require('../Raid.js')
const ActiveRaid = require('../ActiveRaid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {ActiveRaid} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendNew from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);


    //set up variables we'll need
    /**@type {Raid} */
    let raid = {};
    let msgstart = activeRaids.prefix.length + parseArray[0].length + 2 // length of "!raider new "


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
    raid = activeRaids.makeRaid(activeRaids.nextID(), parseArray[0], parseArray[1], parseArray[2], message.author, parseArray[3]);
    if (!activeRaids.quietMode) {
        try {
            await message.channel.send(`Raid: (${raid.id})`, {
                embed: raid.embed()
            }).then(async(raidMessage) => {
                console.debug(`Raid created by ${message.author} in ${message.channel}`);
                await activeRaids.addCountReaction(raidMessage);
                raidMessage.pin().catch((err) => console.error(err))
                raid.addMessage(raidMessage.channel, raidMessage, "info");


            })
        } catch (error) {
            console.error(error);
        }

    }
    activeRaids.saveRaid(raid)
}

module.exports.help = {
    name: "new",
    description: "creates a new raid",
    usage: "new <time>, <pokemon>, <location>[, <guests>]"
}