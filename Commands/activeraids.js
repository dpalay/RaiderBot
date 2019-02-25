/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const Raid = require('../Raid.js');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {
    if (message.author.id === "218550507659067392") {
        console.log(activeRaids);
    }
};


module.exports.help = {
    name: "activeraids",
    description: "logs the active raids to the console for debugging",
    usage: "activeraids"
};