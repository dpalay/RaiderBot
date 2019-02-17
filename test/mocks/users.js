class testUser {

    /**
     * 
     * @param {string} id User's Discord snowflake id
     * @param {string} username Username for the user
     * @param {number} count the number they're bringing to the raid
     */
    constructor(id, username, count) {
        this.id = id;
        this.username = username;
        this.count = count;
    }

    toString() {
        return `<@${this.id}>`
    }

    createDM() {
        return Promise.resolve(true);
    }

}

module.exports = {
    user1: new testUser("123", "user1", 1),
    user2: new testUser("324", "user2", 2),
    user3: new testUser("757", "user3", 3),
    bot: new testUser("ME", "DevBot", 0)
}