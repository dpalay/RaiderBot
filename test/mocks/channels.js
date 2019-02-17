const { user1, user2, user3, bot } = require('./users.js')
const Discord = require('discord.js')
const TestMessage = require('./messages.js')


const users = new Discord.Collection()
users.set(user1.id, user1)
users.set(user2.id, user2)
users.set(user3.id, user3)



class testChannel {

    /**
     * 
     * @param {string} id User's Discord snowflake id
     * @param {string} username Username for the user
     * @param {number} count the number they're bringing to the raid
     */
    constructor(id, name, users) {
        this.id = id;
        this.name = name;
        this.users = users;
    }

    toString() {
        return `<${this.id}>`
    }

    send(msg) {
        return new Promise((res, rej) => { setTimeout(() => res(new TestMessage("replyID", bot, this, msg)), 300) });
    }

}

module.exports = {
    general: new testChannel("1234151", "#general", users)
}