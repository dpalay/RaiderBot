const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log(`sendJoin from ${message.author.username}#${message.author.discriminator} in ${message.channel.name}`);
    console.log(message.content);
    if (parseArray[1]) {
        let ID = parseArray[1].endsWith(',') ? parseArray[1].substring(0, 2).toUpperCase() : parseArray[1].toUpperCase();
        let count = parseInt(parseArray[2]) ? parseInt(parseArray[2]) : 1;
        console.log(`\tID: ${ID}\tcount: ${count}\tparseArray:${parseArray.toString()}`)
        if (count >= 0) {
            // does raid exist
            if (activeRaids.has(ID)) {
                let raid = activeRaids.get(ID);
                if (raid.addUserToRaid(message.author, count) > 0) {
                    await activeRaids.saveRaid(raid); // store the raid to disk
                    message.reply(`added to raid ${ID} owned by ${raid.owner.mention} 
                          Total confirmed is:** ${raid.total()}**`);
                }
            } else {
                message.reply("Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
            }
        } else {
            message.reply(`I didn't understand ${count}. This wasn't a positive number I could recognize.  Try again?`);
        }
    } else {
        message.reply(`I didn't see you supply any sort of ID for the raid you'd like to join. Try again?`)
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}
module.exports.help = {
    name: "join",
    description: "joins the raid with yourself or with guests",
    usage: "join <ID>"
}