class testMessage {

    /**
     * 
     * @param {string} id User's Discord snowflake id
     * @param {string} user Username for the user
     * @param {number} content the number they're bringing to the raid
     */
    constructor(id, author, channel, content) {
        this.id = id;
        this.author = author;
        this.channel = channel;
        this.content = content;
    }

    toString() {
        return content
    }

    reply() {
        return true;
    }

    react() {
        return true;
    }

    pin() {
        return Promise.resolve(this);
    }

    delete() {
        return Promise.resolve(this);
    }

}

module.exports = testMessage;