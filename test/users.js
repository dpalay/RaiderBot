module.exports = {
    userInRaid: {
        id: "123",
        username: "dave's username",
        toString: () => `<@${this.id}>`,
        count: 1
    },
    user2InRaid: {
        id: "324",
        username: "another user",
        toString: () => `<@${this.id}>`,
        count: 3
    },
    userNotInRaid: {
        id: "757",
        username: "Shouldn't be in the raid",
        toString: () => `<@${this.id}>`,
        count: 4
    }
}