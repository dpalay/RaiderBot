const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendTransfer from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    if (parseArray[1]) {
        if (parseArray[1].trim().search(",") >= 0) {
            parseArray.splice(1, 1, ...parseArray[1].split(","))
        }
        let ID = parseArray[1].toUpperCase();
        if (activeRaids.has(ID)) {
            let raid = activeRaids.get(ID);
            if (message.mentions.users.size > 0 && raid.authorized(message)) {
                let user = message.mentions.users.first()
                    //set the owner to be the user with the @mention
                if (raid.owner.id === user.id) {
                    message.reply("you already own this raid. Did you want to give it to someone else?")
                } else {
                    raid.owner = user;
                    message.reply(`Set ${user} as the owner of raid ${ID}`)
                }
            } else {
                message.reply("you don't have permission to give away Raid " + ID)
            }
        } else {
            message.reply("Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
        }
        if (message.channel.type === 'text') {
            message.delete().catch(console.error)
        }
    }
}

module.exports.help = {
    name: "transfer",
    description: "Assigns ownership of the raid",
    usage: "transfer <ID> @user"
}