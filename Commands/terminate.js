/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const Raid = require('../Raid.js');
const ActiveRaid = require('../ActiveRaid.js');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {ActiveRaid} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    if (parseArray[1]) {
        // handle the comma after RaidID
        if (parseArray[1].trim().search(",") >= 0) {
            parseArray.splice(1, 1, ...parseArray[1].split(","));
        }
        let ID = parseArray[1].toUpperCase();
        if (activeRaids.has(ID)) {
            if (activeRaids.get(ID).authorized(message)) {
                let raid = activeRaids.get(ID);
                let sendlist = raid.atAttendees();

                console.log(`attempting to destroy info for ${ID}`);
                //sendInfo(message, parseArray);
                await activeRaids.removeRaid(ID); // clears the raid and removes from disk

                message.channel.send(
                    `${sendlist}
            Raid ${ID} destroyed. Thank you for using Raider!`).then((message) => message.delete(3 * 60 * 1000));
            } else {
                message.reply("Either the raid doesn't exist, or you're not the owner.");
            }
        } else {
            message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid terminate <Raid ID>`");
        }
    }
};

module.exports.help = {
    name: "terminate",
    description: "deletes the listed raid",
    usage: "delete <id>"
};