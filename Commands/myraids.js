const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    message.author.createDM().then((dm) => {
        activeRaids.forEach((raid) => {
            if (raid.userInRaid(message.author, raid)) {
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

module.exports.help = {
    name: "my raids",
    description: "sends the list of raids that the user is a part of",
    usage: "myraids"
}