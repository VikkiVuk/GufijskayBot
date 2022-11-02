import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageActionRowComponent, ActionRowComponent
} from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('add-word')
        .setDescription('Add a word to gufijskay jøzik')
        .addStringOption(option => option.setName('gufijskay').setDescription('The word to add in gufijskay').setRequired(true))
        .addStringOption(option => option.setName('english').setDescription('The word to add in english').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('The description of the word').setRequired(false)),

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
            if (searchableData[0].toString().toLowerCase() === interaction.options.getString('gufijskay').toLowerCase() || searchableData[1].toString().toLowerCase() === interaction.options.getString('english').toLowerCase()) {
                found = true
            }
        });

        if (found) {
            await interaction.editReply({content: `Word is already in the language`});
        } else {
            // send an embed with a button to confirm the word
            const embed = new EmbedBuilder()
                .setTitle('Confirm Word') // @ts-ignore
                .setDescription(`Are you sure you want to add ${interaction.options.getString('gufijskay')}(${interaction.options.getString('english')}) to the language?`)
                .setColor(0x00ff00)

            // make a button to confirm the word
            const button = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success);

            // make a button to deny the word
            const button2 = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            // make a row for the buttons
            const buttonRow = new ActionRowBuilder().addComponents(button, button2);

            // @ts-ignore
            await interaction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then(async (msg) => {
                // @ts-ignore
                const filter = (interaction: MessageActionRowComponent) => interaction.user.id === interaction.user.id;
                // @ts-ignore
                const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

                // @ts-ignore
                let toAdd = [`${interaction.options.getString('gufijskay')}`, `${interaction.options.getString('english')}`];
                // @ts-ignore
                if (interaction.options.getString('description')) {
                    // @ts-ignore
                    toAdd = [...toAdd, `${interaction.options.getString('description')}`];
                }

                let row = await sheet.addRow(toAdd);

                collector.on('collect', async (i: ActionRowComponent) => {
                    if (i.customId === 'confirm') {
                        await row.save();
                        await interaction.editReply({ content: `Added ${row._rawData[0]} to the language`, components: [], embeds: [] });
                        collector.stop("confirmed");
                    } else if (i.customId === 'cancel') {
                        await row.delete();
                        await interaction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                        collector.stop("cancelled");
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === "confirmed" || reason === "cancelled") return;
                    await row.delete();
                    await interaction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                });
            });
        }
    },
};

