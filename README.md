
# discord-emoji-stealer

This script allows you to download a guild's emojis or from all the guilds which you have access to.

## Requirements
- A user or a bot's token
- Developer Mode enabled ([Click me to learn how](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))
- [Node JS](https://nodejs.org/en/download/) installed (Latest LTS recommended)
- A terminal which allows you to enter user input like [PowerShell](https://github.com/PowerShell/PowerShell)
- An internet connection **:v)**

## Installation
- Open your terminal
- Run `git clone https://github.com/thunder04/discord-emoji-stealer` to clone the repository ([Git is required](https://git-scm.com/))
- Run `cd discord-emoji-stealer`
- Run `npm install` - This will install all the required packages and build the `index.ts` file

## Usage
In your terminal, run `node .` and follow the instructions

## FAQs
### Can I share my token to my friend or to someone I trust?
No you cannot. Treat your token like it's your password. User/Bot tokens give full access to the owner's account without the need to know your password or email.  

### How can I get my user token?
Using user tokens is not recommended, they can lead to an **account termination**. If you plan on downloading a single guild's emojis which is either public or you have `Manage Server` permission (to invite the bot), it's recommended to create a bot instead. Read the next question to learn how. 

- Open Developer Tools
- -  On Windows: `CTRL + SHIFT + I`
- - On Mac: `Command ⌘ + Option + I`
- Go to the "Network" tab
- Make an API request and find that request
- - For example, go to your account settings and find the `profile` request (don't forget to click on it)
- Go to the "Request Headers" and find the `authorization` header
- Copy its value (this is your token)

### How can I get my bot's token?
You have to create a bot application first.

 - Open the [Discord developer portal](https://discord.com/developers/applications) and log into your account.
 -  Click the "New Application" button
 - Enter a name for the application and confirm.
 - Go to the Bot tab, click on the "Add Bot" button and confirm changes.
 - Click on the "Copy" button (this is your bot's token)