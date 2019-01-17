class Attendee {
    /**
     * 
     * @param {String} userID The Discord User's Id
     * @param {String} username The Discord User's username
     * @param {String} mention 
     * @param {*} count 
     */
    constructor(userID, username, mention, count = 1) {
        this.id = userID;
        this.username = username;
        this.mention = mention;
        this.count = count;
        this.here = false;

    }
    toString() {
        return this.mention;
    };
}

module.exports = Attendee