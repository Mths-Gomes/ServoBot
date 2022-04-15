const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('loads songs from Youtube')
    .addSubcommand((subCommand) =>
      subCommand
        .setName('song')
        .setDescription('loads a single song from a url')
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription("the song's url")
            .setRequired(true),
        ),
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName('playList')
        .setDescription('Loads a playlist of songs from a url')
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription("the playlist's url")
            .setRequired(true),
        )
        .addSubcommand((subCommand) =>
          subCommand
            .setName('search')
            .setDescription('Searches for song based on provided keywords')
            .addStringOption((option) =>
              option
                .setName('searchterms')
                .setDescription('the search keywords')
                .setRequired(true),
            ),
        ),
    ),
  run: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        'You need to be in a voice channel to use this command',
      );

    const queue = await client.player.createQueue(interaction.guild);
    if (!queue.connection)
      return await queue.connect(interaction.member.voice.channel);

    let embed = new MessageEmbed();

    if (interaction.option.getSubcommand() === 'song') {
      let url = interaction.option.getString('url');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      });
      if (result.tracks.length === 0)
        return interaction.editReply('No Results');

      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the Queue`,
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
    } else if (interaction.option.getSubcommand() === 'playlist') {
      let url = interaction.option.getString('url');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      });
      if (result.tracks.length === 0)
        return interaction.editReply('No Results');

      const playlist = result.playlist;
      await queue.addTracks(result.tracks);
      embed
        .setDescription(
          `**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the Queue`,
        )
        .setThumbnail(playlist.thumbnail);
      //.setFooter({ text: `Duration: ${playlist.duration}` });
    } else if (interaction.option.getSubcommand() === 'search') {
      let url = interaction.option.getString('searchterms');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
      if (result.tracks.length === 0)
        return interaction.editReply('No Results');

      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the Queue`,
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
    }
    if (!queue.playing) await queue.play();
    await interaction.editReply({
      embeds: [embed],
    });
  },
};
