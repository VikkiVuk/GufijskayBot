"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
// @ts-ignore
const google_spreadsheet_1 = require("google-spreadsheet");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('add-word')
        .setDescription('Add a word to gufijskay jøzik'),
    // .addStringOption(option => option.setName('gufijskay').setDescription('The word to add in gufijskay').setRequired(true))
    // .addStringOption(option => option.setName('english').setDescription('The word to add in english').setRequired(true))
    // .addStringOption(option => option.setName('description').setDescription('The description of the word').setRequired(false)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // reply with a modal
            const modal = new discord_js_1.ModalBuilder()
                .setTitle('Add a word to gufijskay jøzik')
                .setCustomId('word-add');
            const input1 = new discord_js_1.TextInputBuilder()
                .setCustomId('gufijskay')
                .setPlaceholder('Gufijskay')
                .setStyle(discord_js_1.TextInputStyle.Short)
                .setLabel('Gufijskay');
            const input2 = new discord_js_1.TextInputBuilder()
                .setCustomId('english')
                .setPlaceholder('English')
                .setStyle(discord_js_1.TextInputStyle.Short)
                .setLabel('English');
            const input3 = new discord_js_1.TextInputBuilder()
                .setCustomId('description')
                .setPlaceholder('Description')
                .setStyle(discord_js_1.TextInputStyle.Paragraph)
                .setLabel('Description')
                .setRequired(false);
            const inputRow = new discord_js_1.ActionRowBuilder().addComponents(input1);
            const inputRow2 = new discord_js_1.ActionRowBuilder().addComponents(input2);
            const inputRow3 = new discord_js_1.ActionRowBuilder().addComponents(input3);
            // @ts-ignore
            modal.addComponents(inputRow, inputRow2, inputRow3);
            yield interaction.showModal(modal);
            // filter for the modal interaction
            const filter = (i) => i.customId === 'word-add' && i.user.id === interaction.user.id;
            yield interaction.awaitModalSubmit({ filter: filter, time: 30000 }).then((modalInteraction) => __awaiter(this, void 0, void 0, function* () {
                yield modalInteraction.deferReply();
                // check if the user is VikkiVuk#0001 or X Master Woo#5269
                if (modalInteraction.user.id !== "750725036096094208" && modalInteraction.user.id !== "429331889619337218") {
                    yield modalInteraction.editReply({ content: "You do not have permission to use this command." });
                    return;
                }
                const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
                yield doc.useServiceAccountAuth({
                    client_email: process.env.CLIENT_EMAIL,
                    private_key: process.env.PRIVATE_KEY,
                });
                yield doc.loadInfo();
                const sheet = doc.sheetsByTitle["Cave man Gufijskay"];
                const rows = yield sheet.getRows();
                // get the values from the modal
                const gufijskay = modalInteraction.fields.getTextInputValue('gufijskay');
                const english = modalInteraction.fields.getTextInputValue('english');
                const description = modalInteraction.fields.getTextInputValue('description');
                let found = false;
                yield rows.forEach((row) => {
                    // @ts-ignore
                    let data = row["_rawData"];
                    let searchableData = [data[0], data[1]];
                    // @ts-ignore
                    if (searchableData[0].toString().toLowerCase() === gufijskay.toLowerCase() || searchableData[1].toString().toLowerCase() === english.toLowerCase()) {
                        found = true;
                    }
                });
                if (found) {
                    yield modalInteraction.editReply({ content: "The word already exists in the dictionary." });
                    return;
                }
                else {
                    // send an embed with a button to confirm the word
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle('Confirm Word') // @ts-ignore
                        .setDescription(`Are you sure you want to add ${gufijskay}(${english}) to the language?`)
                        .setColor(0x00ff00);
                    // make a button to confirm the word
                    const button = new discord_js_1.ButtonBuilder()
                        .setCustomId('confirm')
                        .setLabel('Confirm')
                        .setStyle(discord_js_1.ButtonStyle.Success);
                    // make a button to deny the word
                    const button2 = new discord_js_1.ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle(discord_js_1.ButtonStyle.Secondary);
                    // make a row for the buttons
                    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(button, button2);
                    // @ts-ignore
                    yield modalInteraction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then((msg) => __awaiter(this, void 0, void 0, function* () {
                        // @ts-ignore
                        const filter = (modalInteraction) => modalInteraction.user.id === modalInteraction.user.id;
                        // @ts-ignore
                        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
                        // @ts-ignore
                        let toAdd = [`${gufijskay}`, `${english}`];
                        // @ts-ignore
                        if (description) {
                            // @ts-ignore
                            toAdd = [...toAdd, `${description}`];
                        }
                        let row = yield sheet.addRow(toAdd);
                        collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                            if (i.customId === 'confirm') {
                                yield row.save();
                                yield modalInteraction.editReply({ content: `Added ${row._rawData[0]} to the language`, components: [], embeds: [] });
                                collector.stop("confirmed");
                            }
                            else if (i.customId === 'cancel') {
                                yield row.delete();
                                yield modalInteraction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                                collector.stop("cancelled");
                            }
                        }));
                        collector.on('end', (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                            if (reason === "confirmed" || reason === "cancelled")
                                return;
                            yield row.delete();
                            yield modalInteraction.editReply({ content: `Cancelled adding ${row._rawData[0]} to the language`, components: [], embeds: [] });
                        }));
                    }));
                }
            }));
        });
    },
};
