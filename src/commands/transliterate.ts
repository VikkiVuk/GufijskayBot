import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
        .setName('transliterate')
        .setDescription('Translate from english to gufijskay jøzik or vice versa')
        .addSubcommand(subcommand => subcommand.setName('english').setDescription('Translate from gufijskay jøzik to english').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('gufijskay').setDescription('Translate from english to gufijskay jøzik').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true))),

    async execute(interaction: CommandInteraction) {
        // @ts-ignore
        const subcommand = interaction.options.getSubcommand();
        // @ts-ignore
        const text = interaction.options.getString('text');
        const language = subcommand === 'english' ? 'en' : 'gufijskay';
        //await interaction.reply('The language is ' + language + ' and the text is ' + text);
        await interaction.reply({ content: `${(language === 'en') ? "This command is under construction" : "Ovø šutfaken jest podis aflkonstrukt"}`, ephemeral: true })
    },
};

