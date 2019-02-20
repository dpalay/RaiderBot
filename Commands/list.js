const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendList from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let emb = new Discord.RichEmbed();
    emb.setTitle("Active Raids!")
    emb.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
    emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
    if (activeRaids.size == 0) {
        emb.setDescription("There are no currently active raids.\nTry `!raider new <time>, <poke>, <location>` to start a new one.");
        //message.reply({embed: emb});
    } else {
        emb.setDescription("These are the currently active raids:")
        activeRaids.forEach((raid) => {
            emb.addField(raid.id, `**Owner: ** ${raid.owner}
                **Time:** ${raid.time} 
                **Location:** ${raid.location}
                **Pokemon:** #${raid.poke.id} ${raid.poke.name}
                **Attendees:** ${raid.total()}
                **Channels:**${raid.getUniqueChannelList().map((channel) => channel.toString()).join(", ")}`, true);
        })
    }
    //message.reply({embed: emb});
    message.author.createDM().then(
        (dm) => {
            dm.send({
                embed: emb
            });
        }
    );
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

module.exports.help = {
    name: "list",
    description: "sends the list of active raids to the user",
    usage: "list"
}