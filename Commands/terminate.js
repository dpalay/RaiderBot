module.exports.run = async(client, message, activeRaids, parseArray) => {
    if (parseArray[1]) {
        let ID = parseArray[1].toUpperCase();
        if (activeRaids.has(ID) && activeRaids.get(ID).authorized(message, "Message")) {
            let raid = activeRaids.get(ID);
            let sendlist = raid.atAttendees();

            console.log(`attempting to destroy info for ${ID}`)
                //sendInfo(message, parseArray);
            await activeRaids.removeRaid(ID); // clears the raid and removes from disk

            message.channel.send(
                `${sendlist}
            Raid ${ID} destroyed. Thank you for using Raider!`);
        } else {
            message.reply("Either the raid doesn't exist, or you're not the owner.")
        }
    } else {
        message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid terminate <Raid ID>`")
    }
}

module.exports.help = {
    name: "terminate",
    description: "deletes the listed raid",
    usage: "delete <id>"
}