/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const Raid = require('../Raid.js');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendLeave from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    // "!raider leave ##"
    if (parseArray[1]) {
        // handle the comma after RaidID
        if (parseArray[1].trim().search(",") >= 0) {
            parseArray.splice(1, 1, ...parseArray[1].split(","));
        }
        let ID = parseArray[1].toUpperCase();
        //if raid exists
        if (activeRaids.has(ID)) {
            let raid = activeRaids.get(ID);
            // try to remove user to the raid
            if (raid.removeFromRaid(message.author)) {
                message.reply(" removed from raid " + ID + " **Total confirmed is: " + raid.total() + "**");
                activeRaids.saveRaid(raid); // store the raid to disk
            } else {
                message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendLeave() function");
            }
        }
        //raid doesn't exist
        else {
            message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids.");
        }
        if (message.channel.type === 'text') {
            message.delete().catch(console.error);
        }
    }
};

module.exports.help = {
    name: "leave",
    description: "Removes the user from the raid",
    usage: "leave <ID>"
};