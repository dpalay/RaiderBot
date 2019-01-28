const Discord = require('discord.js')

/**
 * @property {Discord.Message} message
 * @property {Discord.Channel} channel
 */
class BotMessage {
    /**
     * 
     * @param {Discord.Channel} channel 
     * @param {Discord.Message} message 
     */
    constructor(channel, message) {
        this.channel = channel;
        this.message = message;
    }

}
module.exports = BotMessage;