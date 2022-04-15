const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Player } = require('discord-player');
const { prefix, clientId } = require('../config.json');

dotenv.config();
const TOKEN = process.env.TOKEN;

const LOAD_COMMAND = process.argv[2] == 'load';

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
});

client.commands = new Discord.Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const commandsFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'));
for (const file of commandsFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.data.name, command);
  if (LOAD_COMMAND) commands.push(command.data.toJSON());
}

if (LOAD_COMMAND) {
  const rest = new REST({ version: '9' }).setToken(TOKEN);
  console.log('Deploying commands');
  rest
    .put(Routes.applicationGuildCommands(clientId), { body: commands })
    .then(() => {
      console.log('Sucessfully loaded');
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  client.on('ready', () => {
    console.log('ServoBot pronto para servir!');
  });

  client.on('interactionCreate', (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) interaction.reply('Not a valid command');

      await interaction.deferReply();
      await command.run({ client, interaction });
    }
    handleCommand();
  });

  client.login(TOKEN);
}
