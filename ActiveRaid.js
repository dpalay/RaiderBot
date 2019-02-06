const Discord = require('discord.js')
const { emojis, randomIds, pokelist } = require('./constant.json');
const Raid = require('./Raid.js')
const BotMessage = require('./BotMessage.js')


class ActiveRaid extends Discord.Collection{
    constructor(client, ...params) {
        super(params)
        this.client = client
    }

}

module.exports = ActiveRaid;