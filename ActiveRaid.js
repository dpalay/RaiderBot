const Discord = require('discord.js')
const { emojis, randomIds, pokelist, commands } = require('./constant.json');
const Raid = require('./Raid.js')
const BotMessage = require('./BotMessage.js')

class ActiveRaid extends Discord.Collection {


    constructor(client, storage, options, ...params) {
        super(params);
        this.storage = storage;
        this.client = client;
        this.pointer = options["pointer"];
        this.quietmode = options["quietmode"];
        this.prefix = options["prefix"];
        this.timeOuts = {};
    }


    /**
     * Generate a new ID of a Raid so that they don't overlap
     * @returns {string} a 2-character ID for a raid. 
     */
    CreateRaidID(randomIds) {
        let tmp = "";
        do {
            tmp = randomIds[this.pointer];
            this.pointer = this.pointer < randomIds.length - 1 ? this.pointer + 1 : 0;
        } while (this.get(tmp));
        this.storage.setItem("pointer", this.pointer).catch((error) => console.log(error));
        return tmp;
    }

    /**
     * @returns {String} finds the next avialable ID for a raid
     */
    nextID() {
        return this.CreateRaidID(randomIds);
    }

    /**
     * 
     * @param {string} id 
     * @param {string} time 
     * @param {string} poke 
     * @param {string} location 
     * @param {Discord.User} owner 
     * @param {number} guests 
     */
    makeRaid(id, time, poke, location, owner, guests) {
        let raid = new Raid(id, time, poke, location, owner, guests, id)
        this.set(id, raid);
        // set timer to remove the raid 
        this.timeOuts[raid.id] = setTimeout(() => this.removeRaid(raid.id), raid.expires - Date.now());
        return raid
    }

    /**
     * Removes a raid from the active raids and removes it from the disk
     * @param {String} id - ID of the raid to delete
     */
    async removeRaid(id) {
        Promise.all(this.get(id).channels.map(
                (botmessage) => {
                    botmessage.message.delete().catch((err) => console.error(err));
                }
            )).then( /* when all messages are deleted */ )
            .finally(() => {
                this.delete(id);
                clearTimeout(this.timeOuts[id]);
            });
        try {
            await this.storage.removeItem(id); // remove the raid from disk
        } catch (error) {
            console.log(error)
        }
        return this;
    }

    /**
     * Saves a flattened raid object to the disk with enough 
     * information to be able to re-load the raid 
     * if there is a system crash
     * @param {Raid} raid The raid to save to the disk.
     */
    async saveRaid(raid) {
        try {
            await this.storage.setItem(raid.id, raid.flatten(), { ttl: raid.expires });
        } catch (error) {
            console.error(error)
        }
    };

    /**
     * Adds the list of emojis as reactions to a message.
     * @param {Discord.Message} message 
     */
    async addCountReaction(message) {
        for (const emoji in emojis) {
            try {
                // have to use await because we want them in order.  
                // Discord has no way of enforcing order since it's a promise
                await message.react(emojis[emoji])
            } catch (err) {
                console.error(err);
            }
        }
    }

    /**
     * 
     * @param {Discord.Message} message 
     */
    processMessage(message) {
        // This is the best way to define args. Trust me.
        let parseArray = message.content.substring(this.prefix.length).trim().split(" ");
        const args = message.content.slice(this.prefix.length).trim().split(/ +/g);
        let command = args.shift().toLowerCase();
        if (command.trim().search(",") >= 0) {
            command = command.split(",")[0];
        }
        if (commands[command]) {
            try {
                let runcommand = require(`./Commands/${commands[command]}.js`);
                runcommand.run(this.client, message, this, parseArray);
            } catch (error) {
                message.author.createDM((dm) => {
                    dm.send(`Hey there, I didn't understand which command you were trying to use in ${message.channel}. Try \`${this.prefix} help\` for a list of commands.`)
                })
                console.log(error);
            }
        } else {
            console.warn(message.content)
            console.warn("Unknown command")
        }
    }
}

module.exports = ActiveRaid;