const Discord = require('discord.js')
const Raid = require('../Raid.js')


// Formatting shortcuts
const newline = "\n";
const nl = newline;
const tab = "\t";

// Constant Embeds
const helpembed = new Discord.RichEmbed().setTitle("Raider Bot Help Information!")
helpembed.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.setDescription("These are the commands available to help organize raids:")
helpembed.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.addField("New", "\tCreates a new raid for others to join.\n\t**Syntax**: `!raider new <time>, <pokemon>, <location> [, <# of people you're bringing>]`\n\t**Example**: `!raider new 3:30, Articuno, Gym on Main St., 3`")
helpembed.addField("Join", "\tJoins an existing raid, listing how many people are in your party.\n\t**Syntax**: `!raider join <RaidID> [, <# of people you're bringing>]`\n\t**Example**: `!raider join 32, 3`")
helpembed.addField("Leave", "\tLeaves a raid, removing you and anyone you're bringing.\n\t**Syntax**: `!raider leave <RaidID>`\n\t**Example**: `!raider leave 42`")
helpembed.addField("Update", "\tChanges the count of people you're bringing.\n\t**Syntax**: `!raider update <RaidID>, <new # of people>`\n\t**Example**: `!raider update 23, 3`\n\nUpdate can also make other changes to a raid. Try `!raider help update` for more information")
helpembed.addField("Info", "\tProvides information about a raid in a neat little message.\n\t**Syntax**: `!raider info <RaidID>`\n\t**Example**: `!raider info 58`")
helpembed.addField("List", "\tLists all the active Raids.\n\t**Syntax**: `!raider list`")
helpembed.addField("Merge", "\tMerges two existing raids, copying the users from one to another.**_You must be the owner of the from raid_**\n\t**Syntax**: `!raider merge <From Raid ID>, <To Raid ID>`\n\t**Example**: `!raider merge 33, 17`")
helpembed.addField("Transfer", "\tTransfers ownership of a raid. **_You must be the owner to grant ownership to someone else._**\n\t**Syntax**: `!raider transfer <RaidID>, <@new Owner>`\n\t**Example**: `!raider transfer 23, @Thanda`")
helpembed.addField("Inactivate", "\tInactivates (deletes) a raid. **_You must be the owner of the raid to inactivate it._**\n\t**Syntax**: `!raider inactivate <RaidID>`\n\t**Example**: `!raider inactivate 4C`")



/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    console.log("sendHelp from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString());
    if (message.content === activeRaids.prefix || message.content === activeRaids.prefix + ' help') {
        message.author.createDM().then(
            (dm) => {
                dm.send({
                    embed: helpembed
                });
            }
        );
    } else if (parseArray[2]) {

        switch (parseArray[2].toLowerCase()) {
            case "new":
            case "join":
            case "leave":
            case "merge":
            case "update":
            case "info":
            case "list":
            default:
                message.reply({
                    embed: helpembed
                })
                message.channel.send("Please note that the Merge command is not yet active.")
                message.channel.send("The owner of a raid can also destroy it with the command `!raider inactivate <Raid ID>`.")
                break;
        }
    }
    if (message.channel.type === 'text') {
        message.delete().catch(console.error)
    }
}

module.exports.help = {
    name: "help",
    description: "sends ussage information",
    usage: "help"
}