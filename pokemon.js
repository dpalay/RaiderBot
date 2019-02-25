const constants = require('./constant.json');
const names = constants.pokelist;
const fuzz = require('fuzzball');

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