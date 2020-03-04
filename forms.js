const fetch = require('node-fetch');
const fs = require('fs');

try {
    let rawdata = fs.readFileSync('forms.json');
    let forms = JSON.parse(rawdata);
    lastCommit = forms.commit
} catch (error) {
    console.log('forms.json was not found. Was forms.json.example copied and renamed to forms.json?')
    process.exit(1)
}

let commitURL = 'https://api.github.com/repos/PokeMiners/game_masters/git/refs/heads/master';

const checkForCommit = async () => {
    try {
        const response = await fetch(commitURL);
        const status = await response.status
        if (status == 200) {
            const latest = await response.json();
            recentCommit = latest.object.sha;
            if (recentCommit === lastCommit) {
                return false;
            }
            return recentCommit
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

let gmURL = 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json';

const getGM = async () => {
    try {
        const response = await fetch(gmURL)
        const status = await response.status
        if (status != 200) {
            console.log('Couldn\'t access latest game_master (did the url change?)')
            return false;
        }
        return await response.json()
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function writeJSON (json, file, message) {
    message = message || 'Data'
    let data = JSON.stringify(json, null, 4);
    let error = false
    fs.writeFileSync(file, data, (err) => {
        if (err) {
            error = true
            console.error(err)
        }
    })
    if (!error) console.log(`${message} written to ${file}`);
}

function saveCommit (newCommit) {
    if (newCommit === false) {
        console.error('Commit should not be false - was GitHub rate limit hit?')
        return
    }
    let rawdata = fs.readFileSync('forms.json');
    let forms = JSON.parse(rawdata);
    forms['commit'] = newCommit
    writeJSON(forms, 'forms.json', `commit: ${newCommit}`)
}

function isUniqueForm(pokemonName, formName) {
    // console.log(pokemonName, formName)
    //Given a pokemon and form name, checks if form is real
    ignoredForms = ['SHADOW', 'PURIFIED', 'FALL_2019', 'COPY_2019'];
    isUnique = true; //can't seem to return inside loop
    ignoredForms.forEach( form => {
        // console.log(pokemonName, formName, form, `${pokemonName}_${form}` === formName)
        if (`${pokemonName}_${form}` === formName) {
            isUnique = false;
        }
    })
    return isUnique;
}

function parseForms() {
    let rawdata = fs.readFileSync('game_master.json');
    let gm = JSON.parse(rawdata);
    console.log('Updating forms');
    newForms = {};
    gm.forEach(item => { //iterate over items in gm
        pokemon = {}
        if (item.templateId.startsWith('FORMS')) { //only care about forms
            pokemonID = parseInt(item['templateId'].split('_')[1].substring(1)).toString().padStart(3, '0')
            pokemon.name = item.formSettings.pokemon
            pokemon.forms = {}
            if ('forms' in item.formSettings) { // some pokemon don't have any shadow forms
                item.formSettings.forms.forEach(form => {
                    if (isUniqueForm(pokemon.name, form.form)) {
                        cleanedName = form.form.replace(`${pokemon.name}_`, '');
                        if ('assetBundleValue' in form) {
                            pokemon['forms'][cleanedName] = form['assetBundleValue'].toString();
                        } else if ('assetBundleSuffix' in form) {
                            pokemon['forms'][cleanedName] = form['assetBundleSuffix'].toString(); // exclusive to armored mewtwo and hatachus?
                        } else {
                            pokemon['forms'][cleanedName] = '00';
                        }
                    }
                })
            } else {
                pokemon['forms']['NORMAL'] = '00';
                // console.log(pokemon)
            }
            pokemon['has_forms'] = (Object.keys(pokemon['forms']).length > 1);
            newForms[pokemonID] = pokemon;
        }
    })
    return newForms;
}

exports.updateForms = async () => {
    let debug = true;
    debug = false;
    const newCommit = await checkForCommit();
    if (!newCommit && debug == false) {
        console.log('No game_master updates found')
        return;
    }
    console.log('New version of game_master found')
    const gm = await getGM();
    if (!gm) return;

    writeJSON(gm, 'game_master.json');
    saveCommit(newCommit);
    newPokemon = parseForms()
    let rawdata = fs.readFileSync('forms.json');
    let oldForms = JSON.parse(rawdata);
    let newForms = oldForms
    newForms.pokemon = newPokemon
    if (newPokemon === oldForms.pokemon)
        writeJSON(newForms, 'forms.json', 'new pokemon forms')
}