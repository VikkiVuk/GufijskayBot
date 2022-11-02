import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet } from "google-spreadsheet";


export = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a word in gufijskay jøzik')
        .addStringOption(option => option.setName('word').setDescription('The word to search for').setRequired(true)),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Cave man Gufijskay"];
        const rows = await sheet.getRows();
        let results: any[] = [];
        await rows.forEach((row: string) => {
            // @ts-ignore
            let data = row["_rawData"]
            let searchableData = [ data[0], data[1] ]
            // @ts-ignore
            if (searchableData.toString().toLowerCase().includes(interaction.options.getString('word'))) {
                results = [...results, data];
            }
        });
        if (!results.length) {
            await interaction.editReply({content: `Word not found`});
        } else {
            if (results.length >= 25) { await interaction.editReply({content: `Found ${results.length} results, could not display all of them`}); return; }
            // loop through results
            let embed = new EmbedBuilder();
            // @ts-ignore
            embed.setTitle(`Results for ${interaction.options.getString('word')}`).setDescription("Here are the results for your search").setColor(0x00ff00);

            results.forEach((result: any) => {
                embed.addFields({ name: result[0], value: `${result[1]} ${(result[2]) ? `- ${result[2]}` : ""}`, inline: false });
            });

            await interaction.editReply({embeds: [embed]});
        }
    },
};

