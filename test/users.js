module.exports = {
    user1: {
        id: "123",
        username: "dave's username",
        toString: () => `<@${this.id}>`,
        count: 1
    },
    user2: {
        id: "324",
        username: "another user",
        toString: () => `<@${this.id}>`,
        count: 2
    },
    user3: {
        id: "757",
        username: "Shouldn't be in the raid",
        toString: () => `<@${this.id}>`,
        count: 3
    }
}