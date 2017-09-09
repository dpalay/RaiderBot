const config = require('./config.json');

const Discord = require('discord.js');
const _ = require('underscore');
const fuzz = require('fuzzball');
const bigInt = require('big-integer')
const client = new Discord.Client({ autoReconnect: true });
const loggerID = config.loggerID;
const raiderID = config.raiderID;
const activeRaids = {};
let ME = raiderID;
const ALPHANUM = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    //https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/1.png sprites for pokemon

const names = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch’d", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew", "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat", "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip", "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking", "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish", "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid", "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle", "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar", "Tyranitar", "Lugia", "Ho-Oh", "Celebi", "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Poochyena", "Mightyena", "Zigzagoon", "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia", "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon", "Aggron", "Meditite", "Medicham", "Electrike", "Manectric", "Plusle", "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt", "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose", "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith", "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol", "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein", "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", "Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys", "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky", "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny", "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax", "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass", "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus", "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott", "Patrat", "Watchog", "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage", "Simisage", "Pansear", "Simisear", "Panpour", "Simipour", "Munna", "Musharna", "Pidove", "Tranquill", "Unfezant", "Blitzle", "Zebstrika", "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur", "Excadrill", "Audino", "Timburr", "Gurdurr", "Conkeldurr", "Tympole", "Palpitoad", "Seismitoad", "Throh", "Sawk", "Sewaddle", "Swadloon", "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott", "Petilil", "Lilligant", "Basculin", "Sandile", "Krokorok", "Krookodile", "Darumaka", "Darmanitan", "Maractus", "Dwebble", "Crustle", "Scraggy", "Scrafty", "Sigilyph", "Yamask", "Cofagrigus", "Tirtouga", "Carracosta", "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zoroark", "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus", "Ducklett", "Swanna", "Vanillite", "Vanillish", "Vanilluxe", "Deerling", "Sawsbuck", "Emolga", "Karrablast", "Escavalier", "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola", "Joltik", "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang", "Tynamo", "Eelektrik", "Eelektross", "Elgyem", "Beheeyem", "Litwick", "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo", "Beartic", "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Mienfoo", "Mienshao", "Druddigon", "Golett", "Golurk", "Pawniard", "Bisharp", "Bouffalant", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Heatmor", "Durant", "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom ", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect", "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja", "Bunnelby", "Diggersby", "Fletchling", "Fletchinder", "Talonflame", "Scatterbug", "Spewpa", "Vivillon", "Litleo", "Pyroar", "Flabebe", "Floette", "Florges", "Skiddo", "Gogoat", "Pancham", "Pangoro", "Furfrou", "Espurr", "Meowstic", "Honedge", "Doublade", "Aegislash", "Spritzee", "Aromatisse", "Swirlix", "Slurpuff", "Inkay", "Malamar", "Binacle", "Barbaracle", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Helioptile", "Heliolisk", "Tyrunt", "Tyrantrum", "Amaura", "Aurorus", "Sylveon", "Hawlucha", "Dedenne", "Carbink", "Goomy", "Sliggoo", "Goodra", "Klefki", "Phantump", "Trevenant", "Pumpkaboo", "Gourgeist", "Bergmite", "Avalugg", "Noibat", "Noivern", "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion", "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina", "Pikipek", "Trumbeak", "Toucannon", "Yungoos", "Gumshoos", "Grubbin", "Charjabug", "Vikavolt", "Crabrawler", "Crabominable", "Oricorio", "Cutiefly", "Ribombee", "Rockruff", "Lycanroc", "Wishiwashi", "Mareanie", "Toxapex", "Mudbray", "Mudsdale", "Dewpider", "Araquanid", "Fomantis", "Lurantis", "Morelull", "Shiinotic", "Salandit", "Salazzle", "Stufful", "Bewear", "Bounsweet", "Steenee", "Tsareena", "Comfey", "Oranguru", "Passimian", "Wimpod", "Golisopod", "Sandygast", "Palossand", "Pyukumuku", "Type: Null", "Silvally", "Minior", "Komala", "Turtonator", "Togedemaru", "Mimikyu", "Bruxish", "Drampa", "Dhelmise", "Jangmo-o", "Hakamo-o", "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord", "Necrozma", "Magearna", "Marshadow"]
const RaidRooms = ['296431380697579523', '353244652624805898', '336638617642467339', '349664336148561920', '349571799283138560', '335202620849258498', '336637868195840000', '336638223667167232', '336638256777003010', '342054368733822977', '349664694849634325', '328269963599151106', '328265358605811712', '342440523304402947']

// Formatting
const newline = "\n";
const nl = newline;
const tab = "\t";

// Constant Embeds
const helpembed = new Discord.RichEmbed().setTitle("Raider Bot Help Information!")
helpembed.setColor(0xEE6600).setTimestamp().setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.setDescription("These are the commands available to help organize raids:")
helpembed.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
helpembed.addField("New", "\tCreates a new raid for others to join.\n\t**Syntax**: `!raider new <time>, <pokemon>, <location> [, <# of people you're bringing>]`\n\t**Example**: `!raider new 3:30, Articuno, Gym on Main St., 3`" +
    nl + nl + tab + "**Alternate Syntax**: `!raider new <time>, <RAID_ID_FROM_MESSAGE>, <Gym>`" +
    nl + tab + "**Example:** `raider new 3:00, ID=352935634740183040?342054368733822977, Metal Birds`")
helpembed.addField("Join", "\tJoins an existing raid, listing how many people are in your party.\n\t**Syntax**: `!raider join <RaidID> [, <# of people you're bringing>]`\n\t**Example**: `!raider join 32, 3`")
helpembed.addField("Leave", "\tLeaves a raid, removing you and anyone you're bringing.\n\t**Syntax**: `!raider leave <RaidID>`\n\t**Example**: `!raider leave 42`")
helpembed.addField("Update", "\tChanges the count of people you're bringing.\n\t**Syntax**: `!raider update <RaidID>, <new # of people>`\n\t**Example**: `!raider update 23, 3`")
helpembed.addField("Info", "\tProvides information about a raid in a neat little message.\n\t**Syntax**: `!raider info <RaidID>`\n\t**Example**: `!raider info 58`")
helpembed.addField("List", "\tLists all the active Raids.\n\t**Syntax**: `!raider list`")
helpembed.addField("Merge", "\tMerges two existing raids, copying the users from one to another.**_You must be the owner of the from raid_**\n\t**Syntax**: `!raider merge <From Raid ID>, <To Raid ID>`\n\t**Example**: `!raider merge 33, 17`")
helpembed.addField("Transfer", "\tTransfers ownership of a raid. **_You must be the owner to grant ownership to someone else._**\n\t**Syntax**: `!raider transfer <RaidID>, <@new Owner>`\n\t**Example**: `!raider transfer 23, @Thanda`")
helpembed.addField("Inactivate", "\tInactivates (deletes) a raid. **_You must be the owner of the raid to inactivate it._**\n\t**Syntax**: `!raider inactivate <RaidID>`\n\t**Example**: `!raider inactivate 4C`")

// Helper functions

/**
 * Checks if the user owns the raid (or is me).  Used in things like transfering, merging, and inactivating raids
 */
function authorized(raid, message) {
    return (raid.owner.id == message.author.id || message.author.id == '218550507659067392') // Admin :)
}

/**
 * Generate a new ID of a Raid so that they don't overlap
 */
function getRaidID() {
    let tmp = ""
    do {
        tmp = Math.floor(Math.random() * 9 + 1) + ALPHANUM[Math.floor(Math.random() * 33)]
    } while (activeRaids[tmp] && tmp != '69')
    return tmp;
}

/**
 * Removes a raid from the active raids
 * @param {*} id - ID of the raid to delete
 */
function clearRaidID(id) {
    delete activeRaids[id];
    return activeRaids;
}

/**
 * WHO'S THAT POKEMON!?
 * Function to try to guess which pokemon the user is trying to type in
 * @param {*} poke - the user's input.  Can be #111, 111, or text
 * @returns the ID of the pokemon they typed in
 */
function interpretPoke(poke) {
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
            pokeID = match[2] + 1; //index, but Pokemon start at a non-zero index (Bulbasaur = 1, not 0)
        } else {
            console.log("&&\tNo idea.  returning what we started with.")
            pokeID = poke;
        }
    }
    return pokeID;
}

function userInRaid(user, raid) {
    return _.find(raid.attendees, (attendee) => {
        return attendee.id == user.id;
    })
}


// Objects
/** Attendee object */
function attendee(userID, username, mention, count = 1) {
    this.id = userID;
    this.username = username;
    this.mention = mention;
    this.count = count;
    this.toString = function() {
        return mention
    };
}

/** Raid object */
function raid(time, poke, location, owner, guests = 1) {
    let tmpuser = new attendee(owner.id, owner.username, owner.toString(), guests)
    this.id = getRaidID();
    this.time = time;
    this.location = location;
    this.gym = location;
    this.locationComment = "";
    this.poke = {}
    this.poke.id = interpretPoke(poke);
    this.poke.name = names[this.poke.id - 1] ? names[this.poke.id - 1] : poke;
    this.owner = tmpuser;
    this.expires = this.poke.id != '150' ? Date.now() + 7200000 : Date.now() + 36000000; //TODO: better expiration
    this.channels = {}
    this.attendees = {};
    //  this.potential = {};  //TODO:  "Maybe" a raid; potentially joining
    //  this.comments = {};   //TODO:  Add in a way for users to add comments to the raid
    this.attendees[owner.id] = tmpuser



    // Add this raid to the active raids
    activeRaids[this.id] = this;

    // functions
    /**
     * raid.total() returns the total number of people planning on showing up to the raid
     */
    this.total = function() {
        let sum = 0;
        _.each(this.attendees, (attendee) => {
            sum = +sum + +attendee.count;
        })
        return sum;
    };

    /**
     * Prints out the various values for the raid.
     */
    this.toString = function() {
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

    /** returns the @mentions of all the attendees as a string. */
    this.listAttendees = function() {
        let str = "";
        _.each(this.attendees, (attendee) => {
            str += tab + tab + attendee.count + tab + " - " + attendee.username + " - " + attendee.mention + nl;
        });
        return str;
    }

    this.atAttendees = function() {
        let str = "";
        _.each(this.attendees, (attendee) => {
            str += attendee.mention + ", ";
        });
        str.substr(0, str.length - 2);
        return str;
    }

    /** Creates an Embed object for this raid */
    this.embed = function() {
        let emb = new Discord.RichEmbed();
        emb.setTitle("Raid Information");
        emb.setColor(0xEE6600).setTimestamp();
        if (names[this.poke.id]) {
            emb.setAuthor("RaiderBot_" + this.poke.name, "https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
            emb.setThumbnail("https://raw.githubusercontent.com/vutran/alfred-pokedex/master/data/sprites/" + (+this.poke.id) + ".png")
        } else {
            emb.setAuthor("RaiderBot", "https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
            emb.setThumbnail("https://s-media-cache-ak0.pinimg.com/originals/ca/4d/a5/ca4da5848311d9a21361f7adfe3bbf55.jpg")
        }
        let str = "**Time: **" + this.time + nl +
            "**Location: **" + this.location + nl
        if (this.gym != this.location) {
            str += "**Gym: **: " + this.gym + nl
        }
        str += "**Pokemon: **#" + this.poke.id + " " + this.poke.name + nl +
            "**Total Attendees: **" + this.total() + nl +
            "**Attendee List:**" + nl + this.listAttendees()

        emb.addField("Raid " + this.id, str);

        return emb;
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

// Removes the user from the raid
function removeFromRaid(raid, user) {
    delete raid.attendees[user.id]
    return true;
}

//Chat commands
//FIXME: help isn't working
//!raider help
function sendHelp(message, parseArray) {
    console.log("sendHelp from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString());
    if (message.content == "!raider" || message.content == '!raider help') {
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
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider new <time>, <poke>, <location>
//!raider new <time>, ID='<messageID>, gym'
function sendNew(message, parseArray) {
    console.log("sendNew from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);

    if (message.content.trim() == '!raider new') {
        sendHelp(message, parseArray)
        return;
    }

    let options = {};
    let r = {};
    let returnFlag = false;


    // no comma
    // "!raider new time pokemon a location count" => ["time", "pokemon", "a", "location", "count"]
    // "!raider new id=12321232132?12321232132" => ["id=12321232132?12321232132"]
    if (!(message.content.indexOf(",") >= 0)) {
        parseArray = message.content.substring(12).split(" ")
    } else {
        // with comma
        // "!raider new time pokemon a location count" => ["time", "pokemon","a", "location", "count"]
        parseArray = message.content.substring(12).split(",").map((m) => {
            return m.trim()
        })
    }

    //!raider new time id='somereally?longstring' More Info
    if (!parseArray[1]) {
        message.channel.send("Sorry, " + message.author + ". I couldn't understand your request.  Perhaps you used the wrong syntax?")
        return;
    }

    if (parseArray[0].indexOf("=") >= 0 && parseArray[0].indexOf("?") >= 0) {
        message.channel.send("Sorry, " + message.author + ". It looks like you didn't have a time before your ID=.  Try creating the raid again? The syntax is `!raider new <time>, ID=<copied raid ID>`")
    } else if (parseArray[1].indexOf("=") >= 0) {
        options.time = parseArray.shift();
        options.msgChan = parseArray.shift();
        if (!options.msgChan.includes('?')) {
            message.channel.send("Sorry, " + message.author + ". I couldn't understand your request.  Perhaps you used the wrong syntax?  There should have been a ? in the ID somewhere.  Did you copy from the Raid Posting?")
            return
        }
        let msgChan = options.msgChan.split("?");
        msgChan[0] = bigInt(msgChan[0].substr(3), 36).toString();
        msgChan[1] = bigInt(msgChan[1], 36).toString();
        options.gym = parseArray.join(" ");

        // go find the message
        if (client.channels.get(msgChan[1])) {

            client.channels.get(msgChan[1]).fetchMessage(msgChan[0]).then((msg) => {
                // console.log(message);

                // set the options for the new raid(time, poke, location, owner, count)
                options.poke = msg.embeds[0].description.split(" ")[0] // gets the #123
                options.location = "[" + msg.embeds[0].title + "](" + msg.embeds[0].url + ")"



                // Call the new raid
                r = new raid(options.time, options.poke, options.location, message.author);
                if (options.gym) {
                    r.gym = options.gym;
                }

                //Let them know the raid is created.

                // Send the embed
                message.channel.send({
                    embed: r.embed()
                })

                message.channel.send("**" + r.time + "**" + " Raid (" + r.id + ") created by " + message.author + " for **" +
                    r.poke.name + "** at **" + r.location.slice(1, r.location.indexOf("]")) + "**" +
                    //nl +/"**Map link**: " + r.location.substr(r.location.indexOf("]"+1)) + 
                    nl + "Others can join this raid by typing `!raider join " + r.id + "`");

                //message.channel.send("Others can join this raid by typing `!raider join " + r.id + "`").then(() => console.log("Raid Created"));
                // remove raid in 2 hours
                setTimeout(() => clearRaidID(r.id), r.expires - Date.now())

            }).catch(() => {
                console.error
                returnFlag = true;
            })

        } else {
            message.channel.send("Sorry, " + message.author + ". I couldn't find a Raid posting with that ID.  Perhaps you used the wrong syntax?")
        }
        //let raidMessage = // get the message id.trim()
        // get the Raid posting
        // get the pokemon and the gym (with link!)
    } else {


        //FIXME: Check the time and find the next instance of that time
        // raid(time, pokemon, location, owner, count)

        r = new raid(parseArray[0], parseArray[1], parseArray[2], message.author, parseArray[3]);
        message.channel.send("**" + r.time + "**" + " Raid (" + r.id + ") created by " + message.author + " for **" +
            r.poke.name + "** at **" + r.location + "**" +
            nl + "Others can join this raid by typing `!raider join " + r.id + "`");
        // remove raid in 2 hours
        setTimeout(() => clearRaidID(r.id), r.expires - Date.now())
    }
}

//!raider transfer raidID @newperson
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
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider join raidID
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
                message.reply("You are already added to the raid. To remove yourself, type `!raider leave " + ID + "` to change the number of players you're bringing, use `!raider update " + ID + ", <new #>`")
            }
        }
        //raid doesn't exist
        else {
            message.reply("Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids.")
        }
    } else {
        message.reply("this wasn't a positive number I could recognize.  Try again?");
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//!raider leave RaidID
function sendLeave(message, parseArray) {
    console.log("sendLeave from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    // "!raider leave ##"
    ID = parseArray[2].toUpperCase();
    //if raid exists
    if (activeRaids[ID]) {
        let raid = activeRaids[ID]
            // try to remove user to the raid
        if (removeFromRaid(raid, message.author)) {
            message.reply(" removed from raid " + ID + " **Total confirmed is: " + raid.total() + "**")
        } else {
            message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendLeave() function")
        }
    }
    //raid doesn't exist
    else {
        message.reply(": Either that raid doesn't exist, or I couldn't process the command.  Type ```\n!raider list\n```\nfor a list of active raids.")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

function sendUpdate(message, parseArray) {
    console.log("sendUpdate from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\t" + message.content);
    let ID = ""
    let count = ""

    //handle if the user used a comma or not
    if (message.content.includes(",")) {
        // "!raider update 23, 3" => [23, 3]
        parseArray = message.content.substring(15).split(",").map((m) => {
            return m.trim()
        })
        ID = parseArray[0].toUpperCase();
        count = parseInt(parseArray[1]);
    } else {
        //!raider update ## #
        ID = parseArray[2].toUpperCase;
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
                    if (removeFromRaid(r, message.author)) {
                        message.reply(" removed from raid " + ID + nl + "Total confirmed is: " + activeRaids[ID].total())
                    } else {
                        message.reply("Well that's odd... This should be unreachable.  Paging @Thanda, your code broke in the sendUpdate() function")
                    }
                } else {
                    r.attendees[message.author.id].count = count;
                    message.reply("Updated total for the raid is now " + r.total())
                }
            } else {
                message.reply("You aren't in this raid.  If you'd like to be, try `!raider join " + ID + "`")
            }
        } else {
            message.reply("Either that raid doesn't exist, or I couldn't process the command.  Type `!raider list` for a list of active raids and `!raider help` for a list of commands.")
        }
    } else {
        message.reply("this wasn't a positive number I could recognize.  Try again?");
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

function sendInfo(message, parseArray) {
    console.log("sendInfo from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    console.log("\tmessage:" + message.content);
    console.log("\tparseArray: " + parseArray.toString())
    if (parseArray[2]) {
        let ID = parseArray[2].toUpperCase();
        let raid = {};
        if (activeRaids[ID]) {
            raid = activeRaids[ID];
            console.log("attempting to send info for " + ID)
                //   message.reply(raid.toString());
            message.channel.send({
                embed: raid.embed()
            });
        } else {
            message.reply("Couldn't find raid " + ID + ".")
        }
    } else {
        message.reply("No raid found")
    }
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}


/** Sends a message to the whole raid.
 * @example !raider message RaidID, [Everything else goes, here]
 */
function sendAtMessage(message, parseArray) {
    console.log("sendMessage from " + message.author.username + "#" + message.author.discriminator + " in " + message.channel.name);
    //if there's a RaidID
    if (parseArray[2]) {
        // handle the comma after RaidID
        if (parseArray[2].trim().search(",") >= 0) {
            parseArray[2] = parseArray[2].split(",")[0];
        }
        let ID = parseArray[2].toUpperCase();
        let user = message.author;
        //if Raid exists.
        if (activeRaids[ID]) {
            let raid = activeRaids[ID];
            if (userInRaid(user, raid)) {
                let fwdmessage = message.content.substr(message.content.indexOf(",") + 1).trim();
                _.each(raid.attendees, (attendee) => {
                    client.users.get(attendee.id).createDM().then((dm) => {
                        dm.send("Message from one of your raids in the " + message.channel + " channel")
                    })

                })
                message.channel.send(raid.atAttendees() + nl + fwdmessage).then(
                    console.log(tab + tab + fwdmessage)
                )
            } else {
                message.author.createDM().then(
                    (dm) => {
                        dm.send("You're not in the raid that you tried to send a message to. Please try again.  `!raider message <Raid ID>, your message here");
                    }
                );
            }
        } else {
            message.reply("Couldn't find raid with an ID of " + ID + ". Try `!raider list` for a list of active raids");
        }
    } else {
        message.reply("I couldn't understand your request. Try again with `!raider send <RaidID>, Message`");
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
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}


//!raider kick raidID @user
function sendKick(message, parseArray) {
    let ID = ""
    let userToKick = ""
    if (parseArray[2]) {
        let raid = activeRaids[ID]
        if (authorized(raid, message)) {
            if (mentions.users.length > 0) {
                for (let i = 0; i < mentions.users.length; i++) {
                    removeFromRaid(raid, mentions.users[i]);
                }
                message.reply("Users have been removed from the raid. **Total confirmed is: " + raid.total() + "**")
            } else {
                message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid kick <Raid ID> @user`")
            }
        } else {
            message.reply("You must be the owner of a raid to kick someone from it.")
        }
    } else {
        message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid kick <Raid ID> @user`")
    }
}


//!raider kill raidID
function sendTerminate(message, parseArray) {
    if (parseArray[2]) {
        ID = parseArray[2].toUpperCase();
        if (activeRaids[ID] && authorized(activeRaids[ID], message)) {
            console.log("attempting to destroy info for " + ID)
            sendInfo(message, parseArray);
            clearRaidID(ID);
            message.reply("Raid " + ID + " destroyed.  Thank you for using Raider!");
        } else {
            message.reply("Either the raid doesn't exist, or you're not the owner.")
        }
    } else {
        message.reply("Sorry, I couldn't understand your request.  I think you were trying `!raid terminate <Raid ID>`")
    }
}

//sends list of raids to the user
function sendMyRaids(message, parseArray) {
    message.author.createDM().then((dm) => {
        _.each(activeRaids, (raid) => {
            if (userInRaid(message.author, raid)) {
                dm.send({
                    embed: raid.embed()
                })
            }
        })
    })
    if (message.channel.type == 'text') {
        message.delete().catch(console.error)
    }
}

//admin command
function sendSpecial(message, parseArray) {
    if (message.author.id == '218550507659067392') {
        if (parseArray[2]) {
            let options = {
                scorer: fuzz.token_set_ratio
            };
            let match = [fuzz.extract(parseArray[2], names, options)[0], fuzz.extract(parseArray[2], names, options)[1], fuzz.extract(parseArray[2], names, options)[2]]
            message.reply(match)
        }
    }
}



// Connected!
client.on('ready', () => {
    console.log('Raider is ready!');
    ME = client.user
});


//When a message is posted
client.on('message', message => {
    if (message.author.id != ME.id) { // logger shouldn't check it's own stuff)

        // If message is from one of the RaidRooms and comes from a webhook
        if (_.find(RaidRooms, (room) => {
                return message.channel.id == room;
            }) && message.author.discriminator == '0000') {
            message.channel.send("ID=" + bigInt(message.id).toString(36) + "?" + bigInt(message.channel.id).toString(36))
        }


        /** FIXME: Delete this eventually */
        else if (message.content === 'pingg') {
            message.author.createDM().then(
                (dm) => {
                    dm.send("pongg");
                }
            );
        }

        //is it a command?
        else if (message.content.toLowerCase().startsWith("!raider")) {
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
                    case "kill":
                        sendTerminate(message, parseArray);
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
                    case "special":
                        sendSpecial(message, parseArray);
                        break;
                    default:
                        break;
                }
            }
        }
    }
});

client.login(config.raider) //logger