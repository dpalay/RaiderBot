#!/usr/bin/env python3

import requests
import sys
import json

def check_for_update():
    """redownload game_master if it was updated, since full repo is almost half a GB"""
    r = requests.get('https://api.github.com/repos/PokeMiners/game_masters/git/refs/heads/master')

    with open('forms.json', 'r') as f:
        forms = json.load(f)
    last_commit = forms['commit']

    # check if most recent commit is the same as the last downloaded
    if r.status_code == 200:
        latest = json.loads(r.text)
        recent_commit = latest['object']['sha']
        if recent_commit == last_commit:
            return False

    r = requests.get('https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json')
    if r.status_code == 200:
        game_master = json.loads(r.text)
    with open('game_master.json', 'w') as f:
        json.dump(game_master, f, indent=4)

    with open('forms.json', 'w') as f:
        forms['commit'] = recent_commit
        json.dump(forms, f, indent=4)

    return True

def is_unique_form(pokemon, name):
    ignored_forms = ['SHADOW', 'PURIFIED', 'FALL_2019', 'COPY_2019']
    if any(f'{pokemon}_{form}' == name for form in ignored_forms):
        return False
    return True

def parse_forms():
    with open('game_master.json', 'r') as f:
        gm = json.load(f)
    new_forms = {}
    for x in gm:
        pokemon = dict()
        if x['templateId'].startswith('FORMS'):
            pokemon_id = str(int(x['templateId'].split('_')[1][1:])).zfill(3)
            pokemon['name'] = x['formSettings']['pokemon']
            pokemon['forms'] = dict()
            if 'forms' in x['formSettings']: # some pokemon don't have any shadow forms
                for form in x['formSettings']['forms']:
                    if is_unique_form(pokemon['name'], form['form']):
                        cleaned_name = form['form'].replace(f"{pokemon['name']}_", '')
                        if 'assetBundleValue' in form:
                            pokemon['forms'][cleaned_name] = str(form['assetBundleValue'])
                        elif 'assetBundleSuffix' in form:
                            pokemon['forms'][cleaned_name] = str(form['assetBundleSuffix'])
                        else:
                            pokemon['forms'][cleaned_name] = '00'
            else:
                pokemon['forms'] = {'NORMAL':'00'}
            pokemon['has_forms'] = len(pokemon['forms']) != 1
            new_forms[pokemon_id] = pokemon

    with open('forms.json', 'r') as f:
        file = json.load(f)
        if file['pokemon'] != new_forms:
            file['pokemon'] = new_forms
    with open('forms.json', 'w') as f:
        json.dump(file, f, indent=4)

debug = False
debug = True
if check_for_update() or debug:
    parse_forms()