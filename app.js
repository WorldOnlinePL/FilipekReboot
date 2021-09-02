const chalk             = require('chalk');
const log               = require('loglevel');
const prefix            = require('loglevel-plugin-prefix');
const Discord           = require('discord.js');
const mysql             = require('sync-mysql');
const MetoFunctions     = require('./functions/metonator_functions.js');

const Settings          = require('./settings.json');

prefix.reg(log);
log.enableAll();

const colors = {TRACE: chalk.magenta,DEBUG: chalk.cyan,INFO: chalk.blue,WARN: chalk.yellow,ERROR: chalk.red};
prefix.apply(log, {
    format(level, name, timestamp) {
        return `${chalk.white(`[${timestamp}]`)}${colors[level.toUpperCase()](`[${level}]`)}${chalk.yellow(`[${name}]`)}:`;
    }, levelFormatter(level) {
        return level.toUpperCase();
    }, nameFormatter(name) {
        return name || 'main';
    }, timestampFormatter(date) {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}.${chalk.grey(`${MetoFunctions.lpad(date.getMilliseconds(), 3)}`)}`;
    },
});

log.getLogger("app.js").debug(`Booting!`);

var con_static = new mysql(Settings.MysqlService);
try {
    const result = con_static.query('SELECT 1 + 1 AS solution');
    log.getLogger("sync-mysql").info(`Connected as ${Settings.MysqlService.user}@${Settings.MysqlService.host} to ${Settings.MysqlService.database}!`);
} catch(Exception) {
    log.getLogger("sync-mysql").error(`${Exception}`);
}

const client = new Discord.Client();
client.login(Settings.Discord.Token);
client.on('ready', () => { 
    log.getLogger("discord.js").info(`Connected as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.channel.type === "dm")   return; //Disable DMs Here
    if (message.webhookID)              return; //Disable WebHooker

    if(message.content.indexOf(Settings.Discord.Prefix) == 0) {
		var msg = message.content;
		var commands = msg.substring(Settings.Discord.Prefix.length);
        var args = commands.split(" ");
        
        switch(args['0'].toLowerCase()) {
            case 'eval':
                if(message.member.id == 793161523643809803) {
                    try {
                        const args = message.content.split(" ").slice(1);
                        const code = args.join(" ");
                        let evaled = eval(code);
                  
                        if (typeof evaled !== "string")
                            evaled = require("util").inspect(evaled);
                  
                        message.channel.send(MetoFunctions.evalClean(evaled), {code:"xl"});
                    } catch (err) {
                        message.channel.send(`\`ERROR\` \`\`\`xl\n${MetoFunctions.evalClean(err)}\n\`\`\``);
                    }
                } else {
                    message.reply("you can't do that.");
                }
                break;
        }
    }
});