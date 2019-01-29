const Discord = require('discord.js')

/**
 * @property {Discord.Message} message
 * @property {Discord.Channel} channel
 * @property { 'info' | 'reply' | 'unknown'}
 */
class BotMessage {
    /**
     * 
     * @param {Discord.Channel} channel 
     * @param {Discord.Message} message 
     * @param {'info' | 'reply' | 'unknown'} type
     */
    constructor(channel, message, type = 'unknown') {
        this.channel = channel;
        this.message = message;
        this.type = type;
    }

    /**
     * @returns 
     */
    flatten() {
        return { channel: this.channel.id, message: this.message.id, type: this.type }
    }

}
module.exports = BotMessage;