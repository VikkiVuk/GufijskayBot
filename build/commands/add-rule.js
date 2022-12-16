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
        .setName('add-rule')
        .setDescription('Add a lang rule to Gufijskay Jøzik'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // reply with a modal
            const modal = new discord_js_1.ModalBuilder().setTitle('Add a rule to Gufijskay Jøzik').setCustomId('rule-add');
            const input1 = new discord_js_1.TextInputBuilder().setCustomId('rule').setPlaceholder('Rule').setStyle(discord_js_1.TextInputStyle.Short).setLabel('Rule');
            const input2 = new discord_js_1.TextInputBuilder().setCustomId('example').setPlaceholder('Example').setStyle(discord_js_1.TextInputStyle.Paragraph).setLabel('Example');
            const inputRow = new discord_js_1.ActionRowBuilder().addComponents(input1);
            const inputRow2 = new discord_js_1.ActionRowBuilder().addComponents(input2);
            // @ts-ignore
            modal.addComponents(inputRow, inputRow2);
            yield interaction.showModal(modal);
            // filter for the modal interaction
            const filter = (i) => i.customId === 'rule-add' && i.user.id === interaction.user.id;
            yield interaction.awaitModalSubmit({ filter: filter, time: 60000 }).then((modalInteraction) => __awaiter(this, void 0, void 0, function* () {
                yield modalInteraction.deferReply();
                // check if the user is VikkiVuk#0001 or X Master Woo#5269
                if (modalInteraction.user.id !== "750725036096094208" && modalInteraction.user.id !== "429331889619337218") {
                    yield modalInteraction.editReply({ content: "You do not have permission to use this command." });
                    return;
                }
                const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
                yield doc.useServiceAccountAuth({ client_email: process.env.CLIENT_EMAIL, private_key: process.env.PRIVATE_KEY, });
                yield doc.loadInfo();
                const sheet = doc.sheetsByTitle["Da rules"];
                const rule = modalInteraction.fields.getTextInputValue('rule');
                const example = modalInteraction.fields.getTextInputValue('example');
                const embed = new discord_js_1.EmbedBuilder().setTitle('Confirm Word').setDescription(`Are you sure you want to add rule \`${rule}\` to the language?`).setColor(0x00ff00);
                const button = new discord_js_1.ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(discord_js_1.ButtonStyle.Success);
                const button2 = new discord_js_1.ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(discord_js_1.ButtonStyle.Secondary);
                const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(button, button2);
                // @ts-ignore
                yield modalInteraction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then((msg) => __awaiter(this, void 0, void 0, function* () {
                    const filter = (modalInteraction) => modalInteraction.user.id === modalInteraction.user.id;
                    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
                    let row = yield sheet.addRow([rule]);
                    yield sheet.loadCells();
                    collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                        if (i.customId === 'confirm') {
                            yield row.save();
                            yield modalInteraction.editReply({ content: `Added rule \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                            collector.stop("confirmed");
                        }
                        else if (i.customId === 'cancel') {
                            yield row.delete();
                            yield modalInteraction.editReply({ content: `Cancelled adding rule \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                            collector.stop("cancelled");
                        }
                    }));
                    collector.on('end', (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                        if (reason === "confirmed" || reason === "cancelled") {
                            return;
                        }
                        yield row.delete();
                        yield modalInteraction.editReply({ content: `Cancelled adding \`${row._rawData[0]}\` to the language`, components: [], embeds: [] });
                    }));
                }));
            }));
        });
    },
};
