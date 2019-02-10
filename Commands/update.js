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
            parseArray[1] = parseArray[1].split(",")[0];
        }
        let ID = parseArray[1].toUpperCase();
        if (activeRaids.has(ID)) {
            let raid = activeRaids.get(ID)


            // Get the command
            if (parseArray[2]) {
                let cmd = cleanString(parseArray[2]);
                // if it's "count" or a number, then they don't need to have security, they just need to be in the raid
                if (parseInt(cmd) || (cmd === "count" && parseInt(parseArray[3]))) {
                    if (cmd === "count") {
                        count = parseInt(parseArray[3]);
                    } else {
                        count = parseInt(cmd);
                    }
                    raid.addUserToRaid(message.author, count);
                } else if (raid.authorized(message) && parseArray[3]) {
                    switch (cmd) {
                        case "poke":
                        case "pokemon":
                            let poke = cleanString(parseArray[3])
                            raid.setPokemon(poke)
                            console.log("\tUpdating Pokemon to " + raid.poke.name)
                            raid.messageRaid(message.channel, "The Pokemon for raid " + ID + " has been update to " + raid.poke.name, client)
                            break;
                        case "time":
                            //TODO: Add timeOuts to the activeRaids   
                            clearTimeout(activeRaids.timeOuts[raid.id]);
                            let time = cleanString(parseArray[3])
                            raid.time = time;
                            //raid.expires = raid.poke.id != '150' ? Date.now() + 7200000 : Date.now() + 36000000; //TODO: better expiration
                            activeRaids.timeOuts[raid.id] = setTimeout(() => activeRaids.removeRaid(raid.id), raid.expires - Date.now())
                            console.log("\tUpdated Time to " + raid.time)
                            raid.messageRaid(message.channel, "The time for raid " + ID + " has been updated to " + raid.time, client)
                            break;
                        case "gym":
                            raid.gym = parseArray.slice(3).join(" ");
                            console.log("\tUpdated Gym to " + raid.gym)
                            raid.messageRaid(message.channel, "The gym for raid " + ID + " has been updated to " + raid.gym, client)
                            break;
                        case "location":
                            raid.location = parseArray.slice(3).join(" ");
                            console.log("\tUpdated location to " + raid.location)
                            raid.messageRaid(message.channel, "The location for raid " + ID + " has been updated to " + raid.location, client)
                            break;
                        case "expire":
                        case "expiration":
                        case "expires":
                        case "timer":
                            /*
                                let expires = tmp.shift();
                                if (parseInt(expires)) {
                                    clearTimeout(timeOuts[raid.id]);
                                    raid.expires = Date.now() + parseInt(expires) * 60 * 1000;
                                    timeOuts[raid.id] = setTimeout(() => activeRaids.removeRaid(raid.id), raid.expires - Date.now())
                                }
                                */
                            break;
                        default:
                            break;
                    }
                    raid.updateInfo();
                }
            }
        } else {
            // No Raid with that ID found.
            message.author.createDM().then((dm) => {
                dm.send("Sorry, I couldn't process the command.\nType `!raider list` for a list of active raids and `!raider help` for a list of commands.\nYou typed `" + message + "`")
            }).catch(console.error)
        }
    }
}


module.exports.help = {
    name: "update",
    description: "updates some feature of the raid.  Examples: count, pokemon, location, gym, time",
    usage: "update <ID> <feature> information"
}

function cleanString(string) {
    return string.trim().search(",") >= 0 ? string.split(",")[0] : string

}