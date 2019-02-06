
const Discord = require('discord.js')
const Raid = require('../Raid.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Collection<any,Raid>} activeRaids
 * @param {Array<String>} parseArray
 */
module.exports.run = async(client, message, activeRaids, parseArray) => {}

module.exports.help = {
    name: "transfer",
    description: "Assigns ownership of the raid",
    usage: "transfer <ID> @user"
}