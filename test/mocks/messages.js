const { user1, user2, user3 } = require('./users.js')
class testMessage {

    /**
     * 
     * @param {string} id User's Discord snowflake id
     * @param {string} user Username for the user
     * @param {number} content the number they're bringing to the raid
     */
    constructor(id, user, content) {
        this.id = id;
        this.user = user;
        this.content = content;
    }

    toString() {
        return content
    }

}

module.exports = {
    message1: new testMessage("message1", user1, "!test new 1,2,3"),
}