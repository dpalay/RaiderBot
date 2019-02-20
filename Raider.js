const Raid = require('./Raid.js');
let config = {};

// Check for config file
if (process.argv[2]) {
    try {
        let configfile = './' + process.argv[2]
        config = require(configfile);
    } catch (error) {
        config = require('./tester.json')
    }
} else {
    config = require('./tester.json')
    console.error("No config file given.  start with node Raider.js configFileName")
}

const { raidChannels, quietMode, storageDir, prefix, token, debug: isdebug } = config
var { id: ME } = config

//import { emojis, randomIds, pokelist } from "./constant.json";
const { emojis, randomIds, pokelist, commands } = require('./constant.json');

const enmap = require('enmap')

// Set up persistant file storage
const storage = require('node-persist');
storage.initSync({
    dir: storageDir,
})

// EVENTS TO DISABLE TO SAVE MEMORY AND CPU
const eventsToDisable = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'clientUserGuildSettingsUpdate', 'clientUserSettingsUpdate',
    'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildMemberAdd',
    'guildMemberAvailable', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUnavailable', 'guildUpdate', 'messageDelete',
    'messageDeleteBulk', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageUpdate', 'presenceUpdate', 'reconnecting', 'resume',
    'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'typingStop', 'userNoteUpdate', 'userUpdate', 'voiceStateUpdate'
];



// Set up discord.js client
const Discord = require('discord.js');
const client = new Discord.Client({ disabledEvents: eventsToDisable });


function debug(content) {
    if (isdebug) console.log(content)
}

if (isdebug) {
    client.on("error", (e) => console.error(e));
    client.on("warn", (e) => console.warn(e));
    client.on("debug", (e) => console.info(e));
} else {
    //Comment this out if you are not using pm2 and keymetrics.io.  But really, why aren't you using them?  They're awesome!
    // Set up Metric for Keymetrics.io
    let probe = require('pmx').probe()

    let numRaids = probe.metric({
        name: "# of raids",
        value: () => activeRaids.size
    });
}
/**
 * @param {Discord.Channel | Discord.Message} messageOrChannel 
 */
client.canEdit = function(messageOrChannel) {
    if (messageOrChannel instanceof Discord.Message) {
        return messageOrChannel.channel instanceof Discord.TextChannel && messageOrChannel.channel.permissionsFor(ME).has('MANAGE_MESSAGES')
    } else if (messageOrChannel instanceof Discord.Channel) {
        return messageOrChannel instanceof Discord.TextChannel && messageOrChannel.permissionsFor(ME).has('MANAGE_MESSAGES')
    }
}

const ActiveRaid = require('./ActiveRaid.js');
const activeRaids = new ActiveRaid(client, storage, { pointer: 0, quietMode: quietMode, prefix: prefix })

client.on('messageReactionAdd', async(messageReaction, user) => {
    //TODO: Better logic.  The author shouldn't just be Raider, the message should be a raid message
    if (user != ME && messageReaction.message.author === ME && messageReaction.message.embeds.length > 0) {
        debug(`${user.username} added a reaction of ${messageReaction.emoji.name} to ${messageReaction.message.content}`)
        let id
        try {
            id = messageReaction.message.embeds[0].fields[0].name.split(" ")[1]
        } catch (error) {
            console.error(error);
        }
        /** @type {Raid} */
        let raid = activeRaids.get(id)
        switch (messageReaction.emoji.name) {
            case "❌":
            case "1⃣":
            case "2⃣":
            case "3⃣":
            case "4⃣":
            case "5⃣":
                // add user to the raid
                raid.addUserToRaid(user, emojis.indexOf(messageReaction.emoji.name))
                break;
            case "✅":
                //TODO:  move this to the raid / attendee objects
                raid.toggleHere(client, user);
                break;
            case "▶":
                raid.sendStart(client, user)
                break;
        }
        await activeRaids.saveRaid(raid);
        messageReaction.remove(user).then((messageReaction) => {
            debug(`removed ${user.username}'s reaction`)
                //messageReaction.message.edit(messageReaction.message.content + "\n\t" + user.username + ": " + messageReaction.emoji.name)
        })
    }
})

//When a message is posted
client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(activeRaids.prefix.toLowerCase()) !== 0) return;
    activeRaids.processMessage(message)
});

// Connected!
client.once('ready', async() => {
    client.user.setActivity(activeRaids.prefix + ' help | More info')
    ME = client.user
    console.log("Loading saved Raids")
        // load the stored raids into memory
    storage.forEach(async(key, val) => {
        if (key === "pointer") {
            activeRaids.pointer == val
        } else {
            if (val.expires <= Date.now()) {
                // remove the raid to disk
                //TODO:  clear out the raid's old messages
                await storage.removeItem(key);
            } else {
                // If it's not the pointer, then it's a flattened raid
                /** @type {FlattenedRaid} */
                let flatRaid = val;

                // Set the owner of the raid.  need to get the user from Discord.
                let owner;
                try {
                    owner = await client.fetchUser(flatRaid.owner.id);
                } catch (error) {
                    console.log(`Tried to set the owner, but couldn't find that user in Discord.  Assuming ownership of the raid`)
                    owner = ME;
                }

                // Create the Raid object
                let raid = new Raid(key, flatRaid.time, flatRaid.poke.id, flatRaid.location, owner);

                // Set the other few pieces of the raid that aren't actually handled by the constructor.  (WHY??)
                raid.gym = flatRaid.gym;
                raid.locationComment = flatRaid.locationComment;
                raid.expires = flatRaid.expires;

                // Add each user to the raid
                flatRaid.attendees.forEach((att) => {
                    raid.addUserToRaid(att, att.count);
                    raid.attendees.get(att.id).here = att.here
                });

                // Cache the messages and add them to the raid
                let messageGetPromises = flatRaid.channels
                    // Take the flattened BotMessage objects that were saved, filter to only be the ones that the client can find
                    .filter((flatchan) => {
                        let channel = client.channels.get(flatchan.channel);
                        return client.canEdit(channel);
                    })
                    // For all the channels that we could find (and that we can edit), build array of Promises for fetching each message
                    .map((flatchan) => {
                        let channel = client.channels.get(flatchan.channel);
                        return channel.fetchMessage(flatchan.message);
                    });
                // Wait for all of the Promises to complete in parallel. 
                try {
                    /**@type {Discord.Message[]} */
                    let messages = await Promise.all(messageGetPromises);
                    // For each of the resulting messages, return an array of objects with message and type of message
                    messages.map((message) => {
                            return {
                                message: message,
                                type: flatRaid.channels.find((flatchan) => flatchan.message === message.id).type
                            };
                        })
                        // Then add each of those messages back to the raid.  PHEW! 
                        .forEach((messagetype) => raid.addMessage(messagetype.message.channel, messagetype.message, messagetype.type));
                } catch (error) {
                    //Oops, something went wrong.
                    console.log("Something went wrong adding the raid's messages back to the raid");
                    console.log("****Error: ");
                    console.log(error);
                    console.log('****Raid:');
                    console.log(raid);
                    console.log('****Value from disk');
                    console.log(val);
                }

                // Set the Timeouts to delete the raids when they're done
                activeRaids.timeOuts[raid.id] = setTimeout(() => activeRaids.removeRaid(raid.id), raid.expires - Date.now())

                //update the raids
                try {
                    raid.updateInfo();
                } catch (error) {
                    console.log(error);
                }

                //Finally, add the raid to the activeRaids
                activeRaids.set(key, raid);
            }
        }
    });
    console.log('Raider is ready!');
});


console.log("Logging in!");
// connect
client.login(token)
    .then(debug("logging into discord.  Getting everything ready"))
    .catch((err) => console.error(err));


/**
 * @typedef {object} FlattenedRaid
 * @property {string} id
 * @property {string} time
 * @property {string} location
 * @property {string} gym
 * @property {string} locationComment
 * @property {{id: number, name: string}} poke
 * @property {{id: string}} owner
 * @property {number} expires
 * @property {{channel:string, message:string, type: 'info' | 'reply' | 'unknown'}[]} channels
 * @property {{id: string, count: number,  mention:string , here: boolean, username: string}[]} attendees
 */