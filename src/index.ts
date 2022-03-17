import DiscordJS, { Intents, Message } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const bot = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

bot.on("ready", () => {
  console.log("Servo is ready to serve");
});

bot.on("messageCreate", (message) => {
  if (message.content === "s.play" && message.author.username !== "Mathєus") {
    message.reply({
      content: `Não sigo ordens de ${message.author.username}, procure você mesmo!`,
    });
  }
  if (message.content === "s.play" && message.author.username === "Mathєus") {
    message.reply({
      content: `Desculpe ${message.author.username}-sama, não fui competente suficiente para atender seu pedido.`,
    });
  }
  if (message.content === "s.help") {
    message.reply({
      content: "Eu nem te conheço, por que te ajudaria?!",
    });
  }
});

bot.login(process.env.TOKEN);
