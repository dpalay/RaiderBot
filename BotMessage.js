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

    flatten(){
        return [channel.id, message.id, type]
    }

}
module.exports = BotMessage;