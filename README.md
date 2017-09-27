# RaiderBot
## Table of contents
1. [Welcome to RaiderBot](https://github.com/dpalay/RaiderBot/blob/master/README.md#welcome-to-riaderbot)
  1. [Shameless Plug](https://github.com/dpalay/RaiderBot/blob/master/README.md#shameless-plug)
  2. [Intro](https://github.com/dpalay/RaiderBot/blob/master/README.md#intro)
    1. [Early steps and problems](https://github.com/dpalay/RaiderBot/blob/master/README.md#early-steps-and-problems)
    2. [Enter RaiderBot](https://github.com/dpalay/RaiderBot/blob/master/README.md#enter-raiderbot)
2. [RaiderBot Usage](https://github.com/dpalay/RaiderBot/blob/master/README.md#raiderbots-usage-after-its-live-on-a-server)
3. [Setting up and Installing RaiderBot](https://github.com/dpalay/RaiderBot/blob/master/README.md#setting-up-and-installing-raiderbot-dev-stuff)


## Welcome to RaiderBot
__TL; DR:__  RaiderBot is for Pokemon GO Discord chats to help organize raids.

### Shameless Plug
I maintain and distribute RaiderBot free of charge.  However, if you enjoy it, please consider donating either directly through [PayPal](https://www.paypal.me/Lthanda) or becoming a patron on [Patreon](https://www.patreon.com/davepalay)  These contributions keep me caffeinated well enough to continue to develop, improve, and support RaiderBot and other bots like it!

### Intro
Pokemon GO's raid mechanics is a pretty interesting twist on an Augmented Reality game.  It forces players to come together and coordinate in order to receive better rewards than they could get alone. However, there is no in-game mechanism for organizing raids.  This makes it risky for some players to go out of their way to get to a location, only to find that no other players were going to that raid (or even knew that raid existed!). 

#### Early Steps and problems
The first solution to this problem was the organic establishment of communities.  Sub-reddits, Facebook groups, Group Mes, Hangouts, and Discord are all examples of places that Pokemon GO regional groups have established themselves.  In my area, near Madison, WI, we have mostly settled onto a single Discord server.  
On the server though, the following situation was fairly common:
> Person 1:  There's an Articuno at the Memorial Rock starting at 3:00.  Anyone interested?
>
> Person 2:  I've got 2 people, we can make it there by 3:20.
>
> Person 3:  I can come, but only if it starts by 3:05
>
> Person 4:  We can't make it
>
> Person 5:  I'll do it at 3:10
>
> Person 1:  So...  

At this point, there's typically several other people on the server waiting for this to resolve before they commit, until finally the time passes, and no one is going because no one else said they'd go too.

This problem gets even worse when the server has overlapping sub-regions.  In that case, the above conversation could be happening in "#downtown" and an entirely separate conversation could be happening in "#northside". With better communication, the raid could have happened.

#### Enter RaiderBot
With RaiderBot, we get to add another layer of organization. When you set up RaiderBot, you give it permission to manage messages in the channels that your raid groups are using.  Using the above example above, the chat would instead look something like this:
> Person 1:  There's an Articuno at Memorial Rock starting at 3:00
>
> Person 1:  !raider new 3:05, Articuno, Memorial Rock
>
> RaiderBot: __3:05__ Raid (4X) created by @Person_1 for __Articuno__ at __Memorial Rock__
>
> Person 3:  !raider join 4x, 3
>
> RaiderBot: @Person_3, added to raid 4X owned by @Person_1 Total confirmed is: _4_
>
> Person 2:  Can't make that, sorry.
>
> Person 2:  !raider new 3:45, Articuno, Memorial Rock, 2
>
> RaiderBot: __3:45__ Raid (9J) created by @Person_2 for __Articuno__ at __Memorial Rock__
>
> Person 4:  !raider join 9J, 4
>
> RaiderBot: @Person_4, added to raid 9J owned by @Person_2 Total confirmed is: _6_

And so on and so forth.  In other channels, anyone could type `!raider info 9j` or `!raider info 4x` to post information about that raid, including time, location, pokemon, and a list of current attendees.

## RaiderBot's Usage (After it's live on a server)
Probably the simpliest thing you can do to learn how to use the bot is type `!raider help` which the bot will then PM you a list of the available commands.


## Setting up and Installing RaiderBot (dev stuff)
Option 2 is listed first because Option 1 is way more work, but I expect more people to go that route.

### Option 2: Have me run it
This is the much simpler option for many, but comes with its own risks.  
1. It won't likely be free.  
 * I'll be asking for some sort of compensation.
2. I can't promise 100% uptime. 
 * I'm running it from my house, on a local machine.  If I lose power, so does RaiderBot.  If I lose internet, so does RaiderBot.
 * If that sort of downtime happened, I'd certainly work with you to find something fair with respect to paymeht (see point #1)

### Option 1: DIY
The recommended method of running RaiderBot is to host it yourself on a server capable of running Node applications.  There's quite a bit of setup involved, but I've done what I can to simplify this.
For now, I'm assuming you're running this on some local machine or a remote server that you have shell access (and thus can treat it like local).
__Note about Heroku:__ I did not design this with hosting elsewhere in mind.  I did work on a heroku build for a little, but couldn't get it stable.  If you want to go that route, consider yourself warned.
#### Install Node and NPM
There's tons of documentation on how to install node and npm.  I may flesh out this section later, but for now, you should get them installed.
#### Install Git
This one's actually optional but HIGHLY recommended.  If you're going to do all the rest of this, you probably want to pull from this repository.  If you have git, you can watch this repository for updates and bring them into your own copy with very little effort.
I personally recommend [GitKraken](https://www.gitkraken.com/) for this.  They don't give me anything to say that, although I wish they did.  I'll modify these sentences if that ever changes.
#### Install a code editor
Another optional.  You've probably got something already, but having a dedicated code editor is really helpful. I use [VS Code](https://code.visualstudio.com/) and love it.
#### Pull the Repo to the local machine
If everything else is set up, this is where it actually starts to get easier, but it DOES assume you know how to use the command prompt in your OS (Windows, OSX, or *nix)
1. Create and open a directory for RaiderBot.  
2. run `git init` in that directory to create an empty repository
3. run `git pull https://github.com/dpalay/RaiderBot`
Congratulations.  You should know have all of RaiderBot's files in the directory.
#### Install dependencies
It's time to get some things put in!
1. run `npm install` in the directory with the files.  
  * This will install all of the dependencies for Raiderbot locally.  Raiderbot uses several other libraries
#### Create a bot
Head on over to [Discord's Bot creation page](https://discordapp.com/developers/applications/me) and make yourself a shiney new bot! For now, I suggest 1 bot per Discord server ("Guild", in Discord speak)
1. Click on "New App" and give your bot a good name.  Pick a fun picture to represent it and creat it!
2. **Important step** Your "App" isn't a bot yet.  To do that, you need to click the "Create a Bot User" button on the page that opens up.
3. Take a look at the Client ID and the Token.  We'll need those for the next few steps.
4. Time to invite the bot to your server.  You can only do this for **servers you own**.  Head over to https://discordapi.com/permissions.html#93184 and enter your Client ID from step 3.  Then, click the link provided on the page.
5. Select the right server to add the bot to, and Double-check that everything looks right.  Once it does, Authorize the bot to join the server.
#### Update config.json
1. One of the files in the repository is `config.json.example`.  Copy that file and name it just `config.json`.
  * `config.json`is the file where we're going to be storing some VERY secret and important data.  **DO NOT POST YOUR config.json file to any websites or add ** 
2. The sample `config.json.example` file contains placeholders for a testing bot (tester) and a real bot (raider). I would suggest leaving tester where it is, and just worrying about raider.  
3. Replace the `Your secret Token for this bot` with the token from step 3 of `Create a bot` above.  
4. Replace the `The discord user id of the bot` with teh Client ID from step 3 of `Create a bot` above.
5. `raidChannels` will only be useful if you're using PokeAlarm's webhooks to post raids in your server.  If you're not doing that, then just leave this as `"raidChannels": []`
6. Save your `config.json` file.
#### Start the bot
If you did everything up to this point, you should be all set.  There are two ways of starting the bot:  
1. `node Raider.js`
  * This is a great way to test changes to the bot, since the log outputs to the console.  However, if the bot crashes, then it does not reboot.
2. `npm start`
  * This actually launches another command: `pm2 start Raider.js`.  [PM2](https://www.npmjs.com/package/pm2) is a process management option designed for node.  It startst the process as a background process, and will automatically restart the process if it crashes.  Additionally, it comes with some pretty sick monitoring tools, and I'm currently adding integration into the [Dashboard](https://app.keymetrics.io/#/) it comes with.


## Final Thoughts
That should be it.  This is the first project that I've done that would potentially be large-scale, so your patience is appreciated.  
