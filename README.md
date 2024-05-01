<h1 align="center">GrowStore</h1>

<center>Discord bot that focuses on "store" / CRUD design system, with the help of MongoDB for the database. As for the name, GrowStore means Growtopia Store, learn more about <a href="https://growtopiagame.com/">Growtopia here</a></center>

## Features

- 🤑 Ability to buy product
- 👀 Ability to see the product list
- 🔔 Ability to set your GrowId and check balance
- 🛠 CRUD system (Privilege for the bot owner(s)):
  - Ability to add stock to database and automatically displays to the product list
  - Ability to update the stock
  - Ability to delete the stock
  - Ability to check the stock folder.
  - Ability to add data txt (only) file so that the user can buy the product

## Useful Information

- If you forked this repository up, and sees the stock folder, do not delete the folder.

- Mainly, this bot uses txt file as the product and the user who bought will be given the txt file.

- To create a stock file, you can only use txt as a file extension alongside the name are very case sensitive.

  - Example:
  - PID_9.txt
    - PID stand for Product ID and the user who bought will have to type PID for the product code.
    - "9" can be higher or lower, are basically the stock count. You need to hardcode the stock count and match the count from the `/product list`
  - So if you have 9 stocks you need to write the stock file as `PID_9`, `PID_8`, and so on.
  - Because in the database itself, its counting the stock. So if you set the stock to 10, the bot will look for the highest stock first.

- For the main currency, this bot uses "World Lock" from Growtopia game. There are no manually add World Lock to your account's balance, unless it's given from the database itself.

- The webhook are integrated with the "bot" from the _Growtopia_ itself, so the bot that are in the _Growtopia_ can detects the donation log and it will send you the embed to your Discord channel.

- To add balance, Set your GrowId first using `/user set <growid>`. This system detects a webhook containing an embed and then detects the _player name_, _item name_, and the _amount_. So the bot will detect for specific item name such as `Diamond Lock` or `World Lock`.

## Installation

- [Create a discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) and [add it to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#creating-and-using-your-invite-link) with the `bot` and `applications.commands` scope
- Install [Node.js](https://nodejs.org/en/) v16.6 or newer
- [Open a command prompt in the same folder](https://www.thewindowsclub.com/how-to-open-command-prompt-from-right-click-menu#:~:text=To%20open%20a%20command%20prompt%20window%20in%20any%20folder%2C%20simply,the%20same%20inside%20any%20folder.) and type `npm i` to install dependencies

## Thats will be it

Dont forget to leave a star on this repository if you like the idea 😄
