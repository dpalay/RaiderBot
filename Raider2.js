const Discord = require('discord.js');
const _ = require('underscore');
const fuzz = require('fuzzball');
const client = new Discord.Client();
const loggerID = "342771447602610176";
const activeRaids = {};
let ME = loggerID;
const ALPHANUM = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9']
//https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/1.png sprites for pokemon

const names = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch’d", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew", "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat", "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip", "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking", "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish", "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid", "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle", "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar", "Tyranitar", "Lugia", "Ho-Oh", "Celebi", "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Poochyena", "Mightyena", "Zigzagoon", "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia", "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon", "Aggron", "Meditite", "Medicham", "Electrike", "Manectric", "Plusle", "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt", "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose", "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith", "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol", "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein", "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", "Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys", "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky", "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny", "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax", "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass", "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus", "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott", "Patrat", "Watchog", "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage", "Simisage", "Pansear", "Simisear", "Panpour", "Simipour", "Munna", "Musharna", "Pidove", "Tranquill", "Unfezant", "Blitzle", "Zebstrika", "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur", "Excadrill", "Audino", "Timburr", "Gurdurr", "Conkeldurr", "Tympole", "Palpitoad", "Seismitoad", "Throh", "Sawk", "Sewaddle", "Swadloon", "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott", "Petilil", "Lilligant", "Basculin", "Sandile", "Krokorok", "Krookodile", "Darumaka", "Darmanitan", "Maractus", "Dwebble", "Crustle", "Scraggy", "Scrafty", "Sigilyph", "Yamask", "Cofagrigus", "Tirtouga", "Carracosta", "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zoroark", "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus", "Ducklett", "Swanna", "Vanillite", "Vanillish", "Vanilluxe", "Deerling", "Sawsbuck", "Emolga", "Karrablast", "Escavalier", "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola", "Joltik", "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang", "Tynamo", "Eelektrik", "Eelektross", "Elgyem", "Beheeyem", "Litwick", "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo", "Beartic", "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Mienfoo", "Mienshao", "Druddigon", "Golett", "Golurk", "Pawniard", "Bisharp", "Bouffalant", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Heatmor", "Durant", "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom ", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect", "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja", "Bunnelby", "Diggersby", "Fletchling", "Fletchinder", "Talonflame", "Scatterbug", "Spewpa", "Vivillon", "Litleo", "Pyroar", "Flabebe", "Floette", "Florges", "Skiddo", "Gogoat", "Pancham", "Pangoro", "Furfrou", "Espurr", "Meowstic", "Honedge", "Doublade", "Aegislash", "Spritzee", "Aromatisse", "Swirlix", "Slurpuff", "Inkay", "Malamar", "Binacle", "Barbaracle", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Helioptile", "Heliolisk", "Tyrunt", "Tyrantrum", "Amaura", "Aurorus", "Sylveon", "Hawlucha", "Dedenne", "Carbink", "Goomy", "Sliggoo", "Goodra", "Klefki", "Phantump", "Trevenant", "Pumpkaboo", "Gourgeist", "Bergmite", "Avalugg", "Noibat", "Noivern", "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion", "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina", "Pikipek", "Trumbeak", "Toucannon", "Yungoos", "Gumshoos", "Grubbin", "Charjabug", "Vikavolt", "Crabrawler", "Crabominable", "Oricorio", "Cutiefly", "Ribombee", "Rockruff", "Lycanroc", "Wishiwashi", "Mareanie", "Toxapex", "Mudbray", "Mudsdale", "Dewpider", "Araquanid", "Fomantis", "Lurantis", "Morelull", "Shiinotic", "Salandit", "Salazzle", "Stufful", "Bewear", "Bounsweet", "Steenee", "Tsareena", "Comfey", "Oranguru", "Passimian", "Wimpod", "Golisopod", "Sandygast", "Palossand", "Pyukumuku", "Type: Null", "Silvally", "Minior", "Komala", "Turtonator", "Togedemaru", "Mimikyu", "Bruxish", "Drampa", "Dhelmise", "Jangmo-o", "Hakamo-o", "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord", "Necrozma", "Magearna", "Marshadow"]


// Formatting
const newline = "\n";
const nl = newline;
const tab = "\t";

// Constant Embeds
const helpembed = new Discord.RichEmbed().setTitle("Raider Bot Help Information!")
helpembed.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.setDescription("These are the commands available to help organize raids:")
helpembed.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.addField("New", "\tCreates a new raid for others to join.\n\t**Syntax**: `!raider new <time>, <pokemon>, <location> [, <# of people you're bringing>]`\n\t**Example**: `!raider new 3:30, Articuno, Gym on Main St., 3`")
helpembed.addField("Join", "\tJoins an existing raid, listing how many people are in your party.\n\t**Syntax**: `!raider join <RaidID> [, <# of people you're bringing>]`\n\t**Example**: `!raider join 32, 3`")
helpembed.addField("Leave", "\tLeaves a raid, removing you and anyone you're bringing.\n\t**Syntax**: `!raider leave <RaidID>`\n\t**Example**: `!raider leave 42`")
helpembed.addField("Update", "\tChanges the count of people you're bringing.\n\t**Syntax**: `!raider update <RaidID>, <new # of people>`\n\t**Example**: `!raider update 23, 3`")
helpembed.addField("Info", "\tProvides information about a raid in a neat little message.\n\t**Syntax**: `!raider info <RaidID>`\n\t**Example**: `!raider info 58`")
helpembed.addField("List", "\tLists all the active Raids.\n\t**Syntax**: `!raider list`")
helpembed.addField("Merge", "\tMerges two existing raids, copying the users from one to another.**_You must be the owner of the from raid_**\n\t**Syntax**: `!raider merge <From Raid ID>, <To Raid ID>`\n\t**Example**: `!raider merge 33, 17`")
helpembed.addField("Transfer", "\tTransfers ownership of a raid. **_You must be the owner to grant ownership to someone else._**\n\t**Syntax**: `!raider transfer <RaidID>, <@new Owner>`\n\t**Example**: `!raider transfer 23, @Thanda`")
helpembed.addField("Inactivate", "\Inactivates (deletes) a raid. **_You must be the owner of the raid to inactivate it._**\n\t**Syntax**: `!raider inactivate <RaidID>`\n\t**Example**: `!raider inactivate 4C`")

// Helper functions

function authorized(raid, message) {
  return (raid.owner == message.author || message.author.id == '218550507659067392') // Admin :)
}

function getRaidID() {
  let tmp = ""
  do {
    tmp = Math.floor(Math.random() * 9 + 1) + ALPHANUM[Math.floor(Math.random() * 34)]
  } while (activeRaids[tmp] && tmp != 69)
  return tmp;
}

function clearRaidID(id) {
  delete activeRaids[id];
  return activeRaids;
}

/**
 * Holder for the pokemon class.  Has an id, name, and sprite
 */
class Pokemon{
  constructor(id, name){
    this.id = id;
    this.name = name;
    this.sprite = "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + this.id + ".png"
  }
   
  /**
  * WHO'S THAT POKEMON!?
  * Function to try to guess which pokemon the user is trying to type in
  * @param {*} poke - the user's input.  Can be #111, 111, or text
  * @returns the ID of the pokemon they typed in
  */
  static interpretPoke(poke) {
   console.log("==INTERPRET POKEMON:  " + poke + "==")
   let pokeID = 0;
   if (poke == 'ttar') {
     poke = "tyranitaur";
     console.log("==\twas ttar, now tyranitaur")
   }
   if (poke.startsWith("#")) {
     console.log("==\tStarted with #")
     pokeID = parseInt(poke.substring(1));
   } else if (parseInt(poke) >= 0) {
     console.log("==\tStarted with a number greater than 0")
     pokeID = parseInt(poke)
   } else {
     console.log("==\tBegin fuzzy search")
     let options = {
       scorer: fuzz.token_set_ratio
     };
     let match = fuzz.extract(poke, names, options)[0]
     console.log("==\t" + match)
     if (match[1] >= 85) { // pretty sure we figured it out
       console.log("==\tHigh Enough Score")
       pokeID = match[2]+1; //index  
     } else {
       console.log("&&\tNo idea.  returning what we started with.")
       pokeID = poke;
     }
   }
   return pokeID;
 }
 
}


// Objects

/** Attendee object */
function attendee(userID, username, mention, count = 1) {
  this.id = userID;
  this.username = username;
  this.mention = mention;
  this.count = count;
  this.toString = function () {
    return mention
  };
}

/** Raid object */
function raid(time, poke, location, owner, guests = 1) {
  let tmpuser = new attendee(owner.id, owner.username, owner.toString(), guests)
  this.id = getRaidID();
  this.time = time;
  this.location = location;
  this.poke = {}
  this.poke.id = interpretPoke(poke);
  this.poke.name = names[this.poke.id - 1] ? names[this.poke.id - 1] : poke;
  this.owner = tmpuser;
  this.expires = Date.now() + 7200000;
  this.attendees = {};
  //  this.potential = {};
  this.attendees[owner.id] = tmpuser
  activeRaids[this.id] = this;
  this.total = function () {
    let sum = 0;
    _.each(this.attendees, (attendee) => {
      sum = +sum + +attendee.count;
    })
    return sum;
  };
  this.toString = function () {
    let str = ""
    str += "Raid ID: " + this.id + nl;
    str += tab + "Time: " + this.time + nl;
    str += tab + "Pokemon: #" + this.poke.id + " " + this.poke.name + nl;
    str += tab + "Location: " + this.location + nl;
    str += tab + "Organizer: " + this.owner + nl;
    str += tab + "Confirmed attendees: " + nl;
    _.each(this.attendees, (attendee) => {
      str += tab + tab + attendee.count + tab + " - " + attendee + nl;
    })
    return str;
  }
  this.listAttendees = function () {
    let str = "";
    _.each(this.attendees, (attendee) => {
      str += tab + tab + attendee.count + tab + " - " + attendee + nl;
    });
    return str;
  }

  this.embed = function () {
    obj = new Discord.RichEmbed();
    obj.setTitle("Raid Information for Raid #" + this.id)
    obj.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
    return obj;
  }
}

// add a user to the raid
function addToRaid(id, user, count = 1) {
  let raid = activeRaids[id]
  if (raid.attendees[user.id])
    return false; // already existed
  raid.attendees[user.id] = new attendee(user.id, user.username, user.toString(), count)
  return true; //successful
}

function removeFromRaid(id, user) {
  let raid = activeRaids[id]
  delete raid.attendees[user.id]
  return true;
}

function sendHelp(message, parseArray) {
  console.log("sendHelp from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  if (message.content == "!raider") {
    message.author.createDM().then(
      (dm) => {
        dm.send({
          embed: helpembed
        });
      }
    );
  } else if (parseArray[2]) {
    switch (parseArray[2].toLowerCase()) {
      case "new":
      case "join":
      case "leave":
      case "merge":
      case "update":
      case "info":
      case "list":
      default:
        message.reply({
          embed: helpembed
        })
        message.channel.send("Please note that the Merge command is not yet active.")
        message.channel.send("The owner of a raid can also destroy it with the command `!raider inactivate <Raid ID>`.")
        break;
    }
  }
}

function sendNew(message, parseArray) {
  console.log("sendNew from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  let r = {};
  // "!raider new time, pokemon, location, count" => ["time", "pokemon", "location", "count"]
  parseArray = message.content.substring(12).split(",").map((m) => {
    return m.trim()
  })
  //FIXME: Check the time and find the next instance of that time
  // raid(time, pokemon, location, owner, count)
  r = new raid(parseArray[0], parseArray[1], parseArray[2], message.author, parseArray[3]);
  message.channel.send("Raid " + r.id + " created by " + message.author + " for " + r.location + " at " + r.time +
    nl + "Others can join this raid by typing `!raider join " + r.id);
  // remove raid in 2 hours
  setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
}

function sendTransfer(message, parseArray) {
  console.log("sendTransfer from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  let r = {}
  let ID = ""
  let user = {}
  // "!raider transfer 23, @person" => ["23", "@person"]
  parseArray = message.content.substring(17).split(",").map((m) => {
    return m.trim()
  })
  ID = parseArray[0]
  // check if the raid exists and there was a target
  if (activeRaids[ID] && message.mentions.users) {
    // get the raid
    r = activeRaids[ID]
    // message author is owner
    if (authorized(r, message)) {
      user = message.mentions.users.first()
      //set the owner to be the user with the @mention
      if (r.owner == user) {
        message.reply("you already own this raid. Did you want to give it to someone else?")
      } else {
        r.owner = user;
        message.reply("Set " + user + " as the owner of raid " + ID)
      }
    } else {
      message.reply(": you don't have permission to give away Raid " + ID)
    }
  } else {
    message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids.")
  }
}

function sendJoin(message, parseArray) {
  console.log("sendJoin from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  let id = ""
  let count = 0;
  //"!raider join ##, 3" => ["##", "3"]
  parseArray = message.content.substring(13).split(",").map((m) => {
    return m.trim()
  })
  ID = parseArray[0].toUpperCase();
  count = parseInt(parseArray[1]) ? parseInt(parseArray[1]) : 1;
  console.log("\tID: " + ID + "\tcount: " + count + "\tparseArray: " + parseArray)
  if (count >= 0) {
    // does raid exist
    if (activeRaids[ID]) {
      // try to add user to the raid
      if (addToRaid(ID, message.author, count)) {
        message.reply(" added to raid " + ID + " owned by " + activeRaids[ID].owner +
          "  Total confirmed is: **" + activeRaids[ID].total() + "**")
      } else {
        message.reply(": You are already added to the raid. To remove yourself, type `\n!raider leave " + ID + "`\nTo change the number of players you're bringing, use `!raider update " + ID + ", <new #>`")
      }
    }
    //raid doesn't exist
    else {
      message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
    }
  } else {
    message.reply("this wasn't a positive number I could recognize.  Try again?");
  }
}

function sendLeave(message, parseArray) {
  console.log("sendLeave from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  // "!raider leave ##"
  ID = parseArray[2].toUpperCase();
  // does raid exist
  if (activeRaids[ID]) {
    // try to remove user to the raid
    if (removeFromRaid(ID, message.author)) {
      message.reply(" removed from raid " + ID + nl + "Total confirmed is: " + activeRaids[ID].total())
    } else {
      message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendLeave() function")
    }
  }
  //raid doesn't exist
  else {
    message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids.")
  }
}

function sendUpdate(message, parseArray) {
  console.log("sendUpdate from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  let ID = ""
  let count = ""
  if (message.content.includes(",")) {
    // "!raider update 23, 3" => [23, 3]
    parseArray = message.content.substring(15).split(",").map((m) => {
      return m.trim()
    })
    ID = parseArray[0]
    count = parseInt(parseArray[1])
  } else {
    //!raider update ## #
    ID = parseArray[2]
    count = parseArray[3];
  }

  console.log("\tID: " + ID + "\tcount: " + count + "\tparseArray: " + parseArray)
  if (count >= 0) {
    let r = {}
    // if raid exists
    if (activeRaids[ID]) {
      r = activeRaids[ID]
      // if the user is part of the raid
      if (r.attendees[message.author.id]) {
        if (count == 0) {
          if (removeFromRaid(ID, message.author)) {
            message.reply(" removed from raid " + ID + nl + "Total confirmed is: " + activeRaids[ID].total())
          } else {
            message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendUpdate() function")
          }
        } else {
          r.attendees[message.author.id].count = count;
          message.reply("Updated total for the raid is now " + r.total())
        }
      } else {
        message.reply(":You aren't in this raid.  If you'd like to be, try `!raider join " + ID + "`")
      }
    } else {
      message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids and `!raider help` for a list of commands.")
    }
  } else {
    message.reply("this wasn't a positive number I could recognize.  Try again?");
  }
}

function sendInfo(message, parseArray) {
  console.log("sendInfo from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  if (parseArray[2]) {
    let ID = parseArray[2].toUpperCase();
    let raid = {};
    if (activeRaids[ID]) {
      raid = activeRaids[ID];
      console.log("attempting to send info for " + ID)
      //   message.reply(raid.toString());
      let emb = new Discord.RichEmbed();
      emb.setTitle("Raid" + ID);
      emb.setColor(0xEE6600).setTimestamp();
      if (names[raid.poke.id]) {
        emb.setAuthor("RaiderBot_" + raid.poke.name, "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+raid.poke.id) + ".png")
        emb.setThumbnail("https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+raid.poke.id) + ".png")
      } else {
        emb.setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
        emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
      }
      let str = tab + "**Time: **" + raid.time + nl +
        tab + "**Location: **" + raid.location + nl +
        tab + "**Pokemon: **#" + raid.poke.id + " " + raid.poke.name + nl +
        tab + "**Total Attendees: **" + raid.total() + nl +
        tab + "**Attendee List:**" + nl + raid.listAttendees()
      /*
      _.each(tmpRaid.attendees, (attendee) => {
        str += tab + tab + attendee.mention + nl
      });*/
      emb.setDescription(str);
      message.channel.send({
        embed: emb
      });
    }
  } else {
    message.reply("No raid found")
  }
}


/** Sends a message to the whole raid.
 * @example !raider message RaidID, [Everything else goes, here]
 */
function sendAtMessage(message, parseArray) {
  console.log("sendMessage from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  if (parseArray[2]) {
    let ID = parseArray[2].toUpperCase();
    if(activeRaids[ID]){
      
    }
    else{
      message.reply("Couldn't find raid with an ID of " + ID + ". Try `!raider list` for a list of active raids");  
    }
  }
  else{
    message.reply("I couldn't understand your request. `!raider send <RaidID>, Message`");
  }
}

/** Sends the list of raids to the user who requested.
 * @example !raider list 
 */
function sendList(message, parseArray) {
  console.log("sendList from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
  console.log("\t" + message.content);
  let emb = new Discord.RichEmbed();
  emb.setTitle("Active Raids!")
  emb.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
  emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
  if (_.size(activeRaids) == 0) {
    emb.setDescription("There are no currently active raids.\nTry `!raider new <time>, <poke>, <location>` to start a new one.");
    //message.reply({embed: emb});
  } else {
    emb.setDescription("These are the currently active raids:")
    _.each(activeRaids, (raid) => {
      emb.addField(raid.id, tab + "**Owner: ** " + raid.owner.mention + nl +
        "**Time: **" + raid.time + nl +
        "**Location: **" + raid.location + nl +
        "**Pokemon: **#" + raid.poke.id + " " + raid.poke.name + nl +
        "**Attendees: **" + raid.total() + nl +
        "`!raider info " + raid.id + "`", true);
    })
  }
  //message.reply({embed: emb});
  message.author.createDM().then(
    (dm) => {
      dm.send({
        embed: emb
      });
    }
  );
}

function sendMyRaids(message, parseArray) {
  if (parseArray[2]) {
    let options = {
      scorer: fuzz.token_set_ratio
    };
    let match = [fuzz.extract(parseArray[2], names, options)[0], fuzz.extract(parseArray[2], names, options)[1], fuzz.extract(parseArray[2], names, options)[2]]
    message.reply(match)
  }
}

client.on('ready', () => {
  console.log('Raider is ready!');
  ME = client.user
});

client.on('message', message => {
  if (message.author.id != loggerID) { // logger shouldn't check it's own stuff)

    /** FIXME: Delete this eventually */
    if (message.content === 'pingg') {
      message.author.createDM().then(
        (dm) => {
          dm.send("pongg");
        }
      );
    }
    //is it a command?
    if (message.content.toLowerCase().startsWith("!raider")) {
      // get the commands
      let parseArray = message.content.split(" ");
      if (parseArray.length == 1) {
        // Just !raider.  DM Help Info
        sendHelp(message, parseArray);
      } else {
        switch (parseArray[1].toLowerCase()) {
          //New Raid
          case "new":
            sendNew(message, parseArray);
            break;

            //Give ownership to someone else
          case "transfer":
            sendTransfer(message, parseArray);
            break;

            //Add self to the raid
          case "join":
            sendJoin(message, parseArray);
            break;

            // Leave the raid 
          case "remove":
          case "leave":
            sendLeave(message, parseArray);
            break;

            // update how many people are going
          case "change":
          case "update":
            sendUpdate(message, parseArray);
            break;

            // get info about raid
          case "info":
            sendInfo(message, parseArray);
            break;

            // Merge two raids
          case "merge":
            message.reply("This command isn't implemented yet.  Sorry!");
            break;

            // Inactivate a raid
          case "terminate":
          case "inactivate":
            if (parseArray[2]) {
              ID = parseArray[2].toUpperCase();

              console.log("attempting to destroy info for " + ID)
              sendInfo(message, parseArray);
              clearRaidID(ID);
              message.reply("Raid " + ID + " destroyed.  Thank you for using Raider!");
            }
            break;

            // List active raids
          case "list":
            sendList(message, parseArray);
            break;

          case "myraids":
            sendMyRaids(message, parseArray);
            break;

          case "kick":
            sendKick(message, parseArray);
            break;

          case "message":
            sendAtMessage(message, parseArray);
            break;

            // Ask for help
          case "help":
            sendHelp(message, parseArray);
            break;

          default:
            break;

        }
      }
    }
  }
});

client.login("MzQ1MjY2OTI0OTMyMDM4NjU2.DIv59g.RvgSKhfttwulF4EFTXHzm6cPYos") //deletebot1