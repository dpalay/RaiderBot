const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
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
            if (raid.userInRaid(user) || message.author.id === '218550507659067392') {
                //TODO:  FIX THIS.  (What if there's no comma!)
                let fwdmessage = parseArray.slice(2).join(" ");
                raid.messageRaid(message.channel, `Message from ${message.author} to Raid ${raid.id}:\n${fwdmessage}`);
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

module.exports.help = {
    name: "message",
    description: "sends a message to the raid",
    usage: "message <id> the rest of the message"
}