const Discord = require('discord.js');
const _ = require('underscore');
const fuzz = require('fuzzball');
const client = new Discord.Client();
const loggerID = "342771447602610176";
let ME = loggerID;
const RaidRooms = ['336638617642467339', '349664336148561920', '349571799283138560', '335202620849258498', '336637868195840000', '336638223667167232', '336638256777003010', '342054368733822977', '349664694849634325', '328269963599151106', '328265358605811712', '342440523304402947']

// Connected!
client.on('ready', () => {
    console.log('Raider is ready!');
    ME = client.user
  });

  _.each(activeRaids, (raid) => {
      if (userInRaid(message.author, raid)) {
        dm.send({
          embed: raid.embed()
        })
      }
    })