import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet } from "google-spreadsheet";


export = {
    data: new SlashCommandBuilder()
        .setName('delete-word')
        .setDescription("Delete a word from Gufijskay Jøzik")
        .addStringOption(option => option.setName('word').setDescription('The word in Gufijskay Jøzik to delete').setRequired(true)),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true});

        // check if the user is VikkiVuk#0001 or X Master Woo#5269
        if (interaction.user.id !== "750725036096094208" && interaction.user.id !== "429331889619337218") {
            await interaction.editReply({ content: "You do not have permission to use this command." });
            return;
        }

        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Cave man Gufijskay"];
        const rows = await sheet.getRows();
        let found = false;

        await rows.forEach((row: string) => {
            // @ts-ignore
            let data = row["_rawData"]
            let searchableData = [ data[0], data[1] ]

            // @ts-ignore
            if (searchableData[0].toString().toLowerCase() === interaction.options.getString('word').toLowerCase()) {
                found = true
                const embed = new EmbedBuilder()
                    .setTitle('Confirm Word Deletion') // @ts-ignore
                    .setDescription(`Are you sure you want to delete ${interaction.options.getString('word')} from the language?`)
                    .setColor(0xff0000)

                const button = new ButtonBuilder()
                    .setCustomId('confirm-delete')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Danger)

                const button2 = new ButtonBuilder()
                    .setCustomId('cancel-delete')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)

                const buttonRow = new ActionRowBuilder()
                    .addComponents([button, button2])

                // @ts-ignore
                interaction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then(async (msg) => {
                    const filter = (i: any) => i.customId === 'confirm-delete' || i.customId === 'cancel-delete';
                    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

                    collector.on('collect', async (i: any) => {
                        if (i.customId === 'confirm-delete') {
                            // @ts-ignore
                            await row.delete();
                            // @ts-ignore
                            await interaction.editReply({ content: `Deleted ${interaction.options.getString('word')}`, components: [], embeds: [] });
                        } else if (i.customId === 'cancel-delete') {
                            // @ts-ignore
                            await interaction.editReply({ content: `Cancelled deletion of ${interaction.options.getString('word')}`, components: [], embeds: [] });
                        }
                    })

                    collector.on('end', async (collected) => {
                        await interaction.editReply({ content: "Deletion cancelled.", components: [], embeds: [] });
                    })
                })
            }
        });

        if (!found) {
            await interaction.editReply({ content: "Word not found.", components: [], embeds: [] });
        }
    },
};

