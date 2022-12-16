import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ActionRowComponent,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle, ModalSubmitInteraction
} from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('add-rule')
        .setDescription('Add a lang rule to Gufijskay Jøzik'),

    async execute(interaction: CommandInteraction) {
        // reply with a modal
        const modal = new ModalBuilder().setTitle('Add a rule to Gufijskay Jøzik').setCustomId('rule-add')

        const input1 = new TextInputBuilder().setCustomId('rule').setPlaceholder('Rule').setStyle(TextInputStyle.Short).setLabel('Rule')

        const input2 = new TextInputBuilder().setCustomId('example').setPlaceholder('Example').setStyle(TextInputStyle.Paragraph).setLabel('Example')

        const inputRow = new ActionRowBuilder().addComponents(input1)
        const inputRow2 = new ActionRowBuilder().addComponents(input2)

        // @ts-ignore
        modal.addComponents(inputRow, inputRow2)

        await interaction.showModal(modal)

        // filter for the modal interaction
        const filter = (i: ModalSubmitInteraction) => i.customId === 'rule-add' && i.user.id === interaction.user.id

        await interaction.awaitModalSubmit({filter: filter, time: 60000}).then(async (modalInteraction: ModalSubmitInteraction) => {
            await modalInteraction.deferReply();

            // check if the user is VikkiVuk#0001 or X Master Woo#5269
            if (modalInteraction.user.id !== "750725036096094208" && modalInteraction.user.id !== "429331889619337218") {await modalInteraction.editReply({ content: "You do not have permission to use this command." });return;}

            const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            await doc.useServiceAccountAuth({client_email: process.env.CLIENT_EMAIL, private_key: process.env.PRIVATE_KEY,});

            await doc.loadInfo();
            const sheet : GoogleSpreadsheet = doc.sheetsByTitle["Da rules"];

            const rule = modalInteraction.fields.getTextInputValue('rule')
            const example = modalInteraction.fields.getTextInputValue('example')

            const embed = new EmbedBuilder().setTitle('Confirm Word').setDescription(`Are you sure you want to add rule \`${rule}\` to the language?`).setColor(0x00ff00)

            const button = new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Success);
            const button2 = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
            const buttonRow = new ActionRowBuilder().addComponents(button, button2);

            // @ts-ignore
            await modalInteraction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then(async (msg) => {
                const filter = (modalInteraction: any) => modalInteraction.user.id === modalInteraction.user.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

                let row : GoogleSpreadsheetRow = await sheet.addRow([rule]);
                await sheet.loadCells();

                collector.on('collect', async (i: ActionRowComponent) => {
                    if (i.customId === 'confirm') {
                        await row.save();
                        await modalInteraction.editReply({ content: `Added rule \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                        collector.stop("confirmed");
                    } else if (i.customId === 'cancel') {
                        await row.delete();
                        await modalInteraction.editReply({ content: `Cancelled adding rule \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                        collector.stop("cancelled");
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === "confirmed" || reason === "cancelled") { return; }
                    await row.delete();
                    await modalInteraction.editReply({ content: `Cancelled adding \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                });
            });
        })
    },
};

