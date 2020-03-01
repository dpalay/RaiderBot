#!/usr/bin/env python3

import requests
import sys
import json

def check_for_update():
    """redownload game_master if it was updated (full repo is ~400MB)"""

    # get most recent commit
    r = requests.get('https://api.github.com/repos/PokeMiners/game_masters/git/refs/heads/master')

    with open('forms.json', 'r') as f:
        forms = json.load(f)
    last_commit = forms['commit']

    # check if most recent commit is the same as the commit of the last downloaded game_master
    if r.status_code == 200:
        latest = json.loads(r.text)
        recent_commit = latest['object']['sha']
        if recent_commit == last_commit:
            return False

    print('New version of game_master found')
    r = requests.get('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json')
    if r.status_code != 200:
        print('Couldn\'t access latest game_master (did the url change?)', file=sys.stderr)
        return False
    
    # save new game_master
    game_master = json.loads(r.text)
    with open('game_master.json', 'w') as f:
        json.dump(game_master, f, indent=4)

    # store commit of current game_master
    with open('forms.json', 'w') as f:
        forms['commit'] = recent_commit
        json.dump(forms, f, indent=4)

    return True

def is_unique_form(pokemon, name):
    """Given a pokemon and form name, checks if form is real"""
    ignored_forms = ['SHADOW', 'PURIFIED', 'FALL_2019', 'COPY_2019']
    if any(f'{pokemon}_{form}' == name for form in ignored_forms):
        return False
    return True

def parse_forms():
    """reads gamemaster and stores relevant data in forms.json"""
    print('Updating forms.json')
    with open('game_master.json', 'r') as f:
        gm = json.load(f)
    new_forms = {}
    for item in gm: # iterate over items in gm
        pokemon = dict()
        if item['templateId'].startswith('FORMS'): # only care about forms
            pokemon_id = str(int(item['templateId'].split('_')[1][1:])).zfill(3) # "FORMS_V0001_POKEMON_BULBASAUR" -> "001"
            pokemon['name'] = item['formSettings']['pokemon']
            pokemon['forms'] = dict()
            if 'forms' in item['formSettings']: # some pokemon don't have any shadow forms
                for form in item['formSettings']['forms']:
                    if is_unique_form(pokemon['name'], form['form']):
                        cleaned_name = form['form'].replace(f"{pokemon['name']}_", '')
                        if 'assetBundleValue' in form:
                            pokemon['forms'][cleaned_name] = str(form['assetBundleValue'])
                        elif 'assetBundleSuffix' in form:
                            pokemon['forms'][cleaned_name] = str(form['assetBundleSuffix']) # exclusive to armored mewtwo and hatachus?
                        else:
                            pokemon['forms'][cleaned_name] = '00'
            else:
                pokemon['forms'] = {'NORMAL':'00'}
            pokemon['has_forms'] = len(pokemon['forms']) > 1
            new_forms[pokemon_id] = pokemon

    # save to 
    with open('forms.json', 'r') as f:
        file = json.load(f)
        if file['pokemon'] == new_forms:
            return
    file['pokemon'] = new_forms
    with open('forms.json', 'w') as f:
        json.dump(file, f, indent=4)

debug = False
# debug = True
if check_for_update() or debug:
    parse_forms()