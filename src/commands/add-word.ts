import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageActionRowComponent,
    ActionRowComponent,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle, ModalSubmitInteraction
} from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('add-word')
        .setDescription('Add a word to Gufijskay Jøzik'),
        // .addStringOption(option => option.setName('gufijskay').setDescription('The word to add in gufijskay').setRequired(true))
        // .addStringOption(option => option.setName('english').setDescription('The word to add in english').setRequired(true))
        // .addStringOption(option => option.setName('description').setDescription('The description of the word').setRequired(false)),

    async execute(interaction: CommandInteraction) {
        // reply with a modal
        const modal = new ModalBuilder()
            .setTitle('Add a word to Gufijskay Jøzik')
            .setCustomId('word-add')

        const input1 = new TextInputBuilder()
            .setCustomId('gufijskay')
            .setPlaceholder('Gufijskay')
            .setStyle(TextInputStyle.Short)
            .setLabel('Gufijskay')

        const input2 = new TextInputBuilder()
            .setCustomId('english')
            .setPlaceholder('English')
            .setStyle(TextInputStyle.Short)
            .setLabel('English')

        const input3 = new TextInputBuilder()
            .setCustomId('description')
            .setPlaceholder('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Description')
            .setRequired(false)

        const inputRow = new ActionRowBuilder().addComponents(input1)
        const inputRow2 = new ActionRowBuilder().addComponents(input2)
        const inputRow3 = new ActionRowBuilder().addComponents(input3)

        // @ts-ignore
        modal.addComponents(inputRow, inputRow2, inputRow3)

        await interaction.showModal(modal)

        // filter for the modal interaction
        const filter = (i: ModalSubmitInteraction) => i.customId === 'word-add' && i.user.id === interaction.user.id

        await interaction.awaitModalSubmit({filter: filter, time: 60000}).then(async (modalInteraction: ModalSubmitInteraction) => {
            await modalInteraction.deferReply();

            // check if the user is VikkiVuk#0001 or X Master Woo#5269
            if (modalInteraction.user.id !== "750725036096094208" && modalInteraction.user.id !== "429331889619337218") {
                await modalInteraction.editReply({ content: "You do not have permission to use this command." });
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

            // get the values from the modal
            const gufijskay = modalInteraction.fields.getTextInputValue('gufijskay')
            const english = modalInteraction.fields.getTextInputValue('english')
            const description = modalInteraction.fields.getTextInputValue('description')


            let found = false;
            await rows.forEach((row: string) => {
                // @ts-ignore
                let data = row["_rawData"]
                let searchableData = [ data[0], data[1] ]

                // @ts-ignore
                if (searchableData[0].toString().toLowerCase() === gufijskay.toLowerCase() || searchableData[1].toString().toLowerCase() === english.toLowerCase()) {
                    found = true
                }
            });

            if (found) {
                await modalInteraction.editReply({ content: "The word already exists in the dictionary." });
                return;
            } else {
                // send an embed with a button to confirm the word
                const embed = new EmbedBuilder()
                    .setTitle('Confirm Word') // @ts-ignore
                    .setDescription(`Are you sure you want to add ${gufijskay}(${english}) to the language?`)
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
                await modalInteraction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then(async (msg) => {
                    // @ts-ignore
                    const filter = (modalInteraction: MessageActionRowComponent) => modalInteraction.user.id === modalInteraction.user.id;
                    // @ts-ignore
                    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

                    // @ts-ignore
                    let toAdd = [`${gufijskay}`, `${english}`];
                    // @ts-ignore
                    if (description) {
                        // @ts-ignore
                        toAdd = [...toAdd, `${description}`];
                    }

                    let row = await sheet.addRow(toAdd);

                    collector.on('collect', async (i: ActionRowComponent) => {
                        if (i.customId === 'confirm') {
                            await row.save();
                            await modalInteraction.editReply({ content: `Added ${row._rawData[0]} to the language`, components: [], embeds: [] });
                            collector.stop("confirmed");
                        } else if (i.customId === 'cancel') {
                            await row.delete();
                            await modalInteraction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                            collector.stop("cancelled");
                        }
                    });

                    collector.on('end', async (collected, reason) => {
                        if (reason === "confirmed" || reason === "cancelled") return;
                        await row.delete();
                        await modalInteraction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                    });
                });
            }
        })
    },
};

