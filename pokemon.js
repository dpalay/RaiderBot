const constants = require('./constant.json');
const names = constants.pokelist;
const fuzz = require('fuzzball');
const forms = require('./forms.json');

/**
 * WHO'S THAT POKEMON!?
 * Function to try to guess which pokemon the user is trying to type in
 * @param {String} poke - the user's input.  Can be #111, 111, or text
 * @returns the ID of the pokemon they typed in
 */
exports.interpretPoke = function interpretPoke(poke) {
    //console.log("==INTERPRET POKEMON:  " + poke + "==")
    let pokeID = 0;
    if (poke == 'ttar') {
        poke = "tyranitaur";
        // console.log("==\twas ttar, now tyranitaur")
    }
    if (poke.toString().startsWith("#")) {
        // console.log("==\tStarted with #")
        pokeID = parseInt(poke.substring(1));
    } else if (parseInt(poke) >= 0) {
        //console.log("==\tStarted with a number greater than 0")
        pokeID = parseInt(poke);
    } else {
        //console.log("==\tBegin fuzzy search")
        let options = {
            scorer: fuzz.token_set_ratio
        };
        let match = fuzz.extract(poke, names, options)[0];
        //console.log("==\t" + match)
        if (match[1] >= 85) { // pretty sure we figured it out
            //console.log("==\tHigh Enough Score")
            pokeID = match[2] + 1; //index, but Pokemon start at a non-zero index (Bulbasaur = 1, not 0)
        } else {
            //console.log("&&\tNo idea.  returning what we started with.")
            pokeID = poke;
        }
    }
    return pokeID;
};

/**
 * Function to try to guess which form the user wants
 * @param {String} poke - text the user typed to specify a pokemon and form
 * @param {Number} pokeID - the ID of a pokemon
 * @returns the ID of the pokemon they typed in
 */
exports.interpretForm = function interpretForm(poke, pokeID) {
    // console.log(poke, pokeID)
    if (pokeID == 150 && poke.toUpperCase().includes('A')) { //armored mewtwo
        var poke = 'MEWTWO_A';
    }
    if (/\d/.test(poke)) { // if number in string
        return 'NORMAL';
    }
    pokeIDStr = pokeID.toString().padStart(3, '0');
    var currentForms = forms.pokemon[pokeIDStr]['forms']
    if (names[pokeID - 1].toUpperCase() === poke.toUpperCase()) { //exact name was typed
        // console.log(currentForms)
        if (Object.keys(currentForms).includes('NORMAL')) {
            return 'NORMAL';
        } else {
            return Object.keys(currentForms)[0]
        }
    }

    if (forms.pokemon[pokeIDStr]['has_forms'] == true) {
        let formList = [];
        var name = forms.pokemon[pokeIDStr]['name']
        for (form in currentForms) {
            formList.push(name + "_" + form);
        }
        let matches = fuzz.extract(poke, formList, {scorer: fuzz.token_sort_ratio})
        let match = matches[0]
        // console.log(matches)
        if (match[1] >= 75) {
            // console.log(forms.pokemon[pokeIDStr])
            // console.log(forms.pokemon[pokeIDStr]['forms'][match[0].replace(name + '_', '')])
            // console.log(match[0])
            return match[0].replace(name.toUpperCase() + '_', '')
        }
    }
    if (Object.keys(currentForms).includes('NORMAL')) {
        return 'NORMAL';
    }
    return Object.keys(currentForms)[0]
};