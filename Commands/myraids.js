const Discord = module.require("discord.js");

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
    name: "list",
    description: "sends the list of active raids to the user",
    usage: "list"
}