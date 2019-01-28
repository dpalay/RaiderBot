const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendInfo from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString())
    if (parseArray[1]) {
        let ID = parseArray[1].toUpperCase();
        if (activeRaids.has(ID)) {
            let raid = activeRaids.get(ID);
            console.log(`attempting to send info for ${ID}`)
                //   message.reply(raid.toString());
            message.channel.send({
                embed: raid.embed()
            }).then((reply) => {
                console.log(`Raid ${ID} information sent to ${message.author.username} in #${message.channel}`)
                raid.addMessage(reply.channel, reply)
            }).catch((err) => console.error(`Raid ${ID} info not sent! ${err}`));
        } else {
            message.reply(`Couldn't find Raid ${ID}.`)
        }
    } else {
        message.reply("No raid found")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}



module.exports.help = {
    name: "info",
    description: "provides information about the selected raid",
    usage: "info <ID>"
}