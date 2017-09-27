# RaiderBot
## Table of contents
1. [Welcome to RaiderBot](https://github.com/dpalay/RaiderBot/blob/master/README.md#welcome-to-riaderbot)
  1. [Shameless Plug]
  2. [Intro]
    1. [Early steps and problems]
    2. [Enter RaiderBot]
2. [RaiderBot Usage](https://github.com/dpalay/RaiderBot/blob/master/README.md#raiderbots-usage-after-its-live-on-a-server)
3. [Setting up and Installing RaiderBot](https://github.com/dpalay/RaiderBot/blob/master/README.md#setting-up-and-installing-raiderbot-dev-stuff)


## Welcome to RaiderBot
__TL; DR:__  RaiderBot is for Pokemon GO Discord chats to help organize raids.

### Shameless Plug
I maintain and distribute RaiderBot free of charge.  However, if you enjoy it, please consider donating either directly through [PayPal](https://www.paypal.me/Lthanda) or becoming a patron on [Patreon](https://www.patreon.com/davepalay)  These contributions keep me caffeinated well enough to continue to develop, improve, and support RaiderBot and other bots like it!

### Intro
Pokemon GO's raid mechanics is a pretty interesting twist on an Augmented Reality game.  It forces players to come together and coordinate in order to receive better rewards than they could get alone. However, there is no in-game mechanism for organizing raids.  This makes it risky for some players to go out of their way to get ot a location, only to find that no other players were going to that raid (or even knew that raid existed!). 

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

####Enter RaiderBot
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
### Option 1: DIY
The recommended method of running RaiderBot is to host it yourself on a server capable of running Node applications.  There's quite a bit of setup involved, but I've done what I can to simplify this.
For now, I'm assuming you're running this on some local machine or a remote server that you have shell access (and thus can treat it like local).
__Note about Heroku:__ I did not design this with hosting elsewhere in mind.  I did work on a heroku build for a little, but couldn't get it stable.  If you want to go that route, consider yourself warned.
#### Install Node and NPM
There's tons of documentation on how to install node and npm.  I may flesh out this section later, but for now, you should get them installed.
#### Install Git
This one's actually optional but HIGHLY recommended.  If you're going to do all the rest of this, you probably want to pull from this repository.  If you have git, you can watch this repository for updates and bring them into your own copy with very little effort.
I personally recommend [GitKraken](https://www.gitkraken.com/) for this.  They don't give me anything to say that, although I wish they did.  I'll modify these sentences if that ever changes.
#### Pull the Repo to the local machine
If everything else is set up, this is where it actually starts to get easier, but it DOES assume you know how to use the command prompt in your OS (Windows, OSX, or *nix)
1. Create and open a directory for RaiderBot.  
2. run `git init` in that directory to create an empty repository
3. run `git pull https://github.com/dpalay/RaiderBot`
Congratulations.  You should know have all of RaiderBot's files in the directory.
#### Install dependencies
It's time 


### Option 2: Have me run it
This is the much simpler option for many, but comes with its own risks.  
1. It won't likely be free.  
 * I'll be asking for some sort of compensation.
2. I can't promise 100% uptime. 
 * I'm running it from my house, on a local machine.  If I lose power, so does RaiderBot.  If I lose internet, so does RaiderBot.
 * If that sort of downtime happened, I'd certainly work with you to find something fair with respect to paymeht (see point #1)

