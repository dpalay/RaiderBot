const Discord = require('discord.js')
    //FIXME:  Need to make these store many messages for each channel.  Right now if it has 2 messages from the same channel, it will reply twice.
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