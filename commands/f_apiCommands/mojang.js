const fs = require('fs');
const { prefix } = require('../../userConfig.json');
const funcImports = require( __dirname + '../../../functions');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
const controller = new AbortController();
const promise = fetch(url, { signal: controller.signal, ...options });
if (signal) signal.addEventListener("abort", () => controller.abort());
const timeout = setTimeout(() => controller.abort(), ms);
return promise.finally(() => clearTimeout(timeout));
};
module.exports = {
	name: 'mojang',
  title: 'Shows the status of Mojang\'s services',
	description: `Checks the status of Mojang services`,
  usage: `\`${prefix}mojang\``,
  args: false,
  database: false,
  cooldown: 10,
  permissions: ["VIEW_CHANNEL","SEND_MESSAGES","EMBED_LINKS","READ_MESSAGE_HISTORY"],
	execute(message, args, client, row) {
    if (row !== undefined) {
			var tzOffset = (row.timezone * 3600000);
			var timeString = new Date(Date.now() + tzOffset).toLocaleTimeString('en-IN', { hour12: true }); 
			var dateString = funcImports.epochToCleanDate(new Date(Date.now() + tzOffset));
		} else {
			var tzOffset = 0
			var timeString = `${new Date().toLocaleTimeString('en-IN', { hour12: true })} UTC`
			var dateString = funcImports.epochToCleanDate(new Date());
		}

    try {
      message.channel.send('Loading..').then(async msg => {
        const controller = new AbortController();

        fetchTimeout(`https://status.mojang.com/check`, 5000, {
          signal: controller.signal
        })
            .then(function(response) {
					    if (!response.ok) {throw new Error("HTTP status " + response.status);}
					    return response.json();
				      })
                .then((mojang) => {
            
        const arr = [];
        
        arr[0] = mojang[7]["mojang.com"].toUpperCase();
        arr[1] = mojang[2]["account.mojang.com"].toUpperCase();
        arr[2] = mojang[3]["authserver.mojang.com"].toUpperCase();
        arr[3] = mojang[4]["sessionserver.mojang.com"].toUpperCase();
        arr[4] = mojang[5]["api.mojang.com"].toUpperCase();
        arr[5] = mojang[0]["minecraft.net"].toUpperCase();
        arr[6] = mojang[1]["session.minecraft.net"].toUpperCase();
        arr[7] = mojang[6]["textures.minecraft.net"].toUpperCase();
        
        
        let a = arr.map(function(item) { return item == 'GREEN' ? ':green_square:' : item; });
        let b = a.map(function(item) { return item == 'YELLOW' ? ':yellow_square:' : item; });
        let array = b.map(function(item) { return item == 'RED' ? ':red_square:' : item; });
        
        
        let mojangStatus = new Discord.MessageEmbed()
          .setColor('#7289DA')
          .setTitle('Mojang Services Status')
          .setDescription('Checks the status of Mojang\'s services')
          .addFields(
            { name: 'mojang.com', value: `${array[0]}` },
            { name: 'account.mojang.com', value: `${array[1]}` },
            { name: 'authserver.mojang.com', value: `${array[2]}` },
            { name: 'sessionserver.mojang.com', value: `${array[3]}` },
            { name: 'api.mojang.com', value: `${array[4]}` },
            { name: 'minecraft.net', value: `${array[5]}` },
            { name: 'session.minecraft.net', value: `${array[6]}` },
            { name: 'textures.minecraft.net', value: `${array[7]}` },
          )
          .setFooter(`Executed at ${dateString} | ${timeString}`, 'https://i.imgur.com/MTClkTu.png')
        
          msg.delete();
          message.reply(mojangStatus);
        
              })
              .catch((err) => {
                if (err.name === "AbortError") {
                  msg.delete();
                  message.channel.send(`${message.author}, an error occured while executing this command. The API failed to respond and may be down. Try again later.`);
                } else {
                  msg.delete();
                  console.log(`Mojang API Error 9: ${err}`);
                  message.channel.send(`${message.author}, Mojang API Error: An error occured while executing this command. \`${err}\``);
                }
              });
            });
    } catch (err) {
      console.log(`Error 10: ${err}`);
      message.channel.send(`${message.author}, something went very wrong outside of a promise catch. Please report this. ERROR_10: \`${err}\``);
    }
	},
};