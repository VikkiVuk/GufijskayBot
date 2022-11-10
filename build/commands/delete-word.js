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
        .setName('delete-word')
        .setDescription("Delete a word from Gufijskay Jøzik")
        .addStringOption(option => option.setName('word').setDescription('The word in Gufijskay Jøzik to delete').setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            // check if the user is VikkiVuk#0001 or X Master Woo#5269
            if (interaction.user.id !== "750725036096094208" && interaction.user.id !== "429331889619337218") {
                yield interaction.editReply({ content: "You do not have permission to use this command." });
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
            let found = false;
            yield rows.forEach((row) => {
                // @ts-ignore
                let data = row["_rawData"];
                let searchableData = [data[0], data[1]];
                // @ts-ignore
                if (searchableData[0].toString().toLowerCase() === interaction.options.getString('word').toLowerCase()) {
                    found = true;
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle('Confirm Word Deletion') // @ts-ignore
                        .setDescription(`Are you sure you want to delete ${interaction.options.getString('word')} from the language?`)
                        .setColor(0xff0000);
                    const button = new discord_js_1.ButtonBuilder()
                        .setCustomId('confirm-delete')
                        .setLabel('Confirm')
                        .setStyle(discord_js_1.ButtonStyle.Danger);
                    const button2 = new discord_js_1.ButtonBuilder()
                        .setCustomId('cancel-delete')
                        .setLabel('Cancel')
                        .setStyle(discord_js_1.ButtonStyle.Secondary);
                    const buttonRow = new discord_js_1.ActionRowBuilder()
                        .addComponents([button, button2]);
                    // @ts-ignore
                    interaction.editReply({ embeds: [embed], components: [buttonRow], fetchReply: true }).then((msg) => __awaiter(this, void 0, void 0, function* () {
                        const filter = (i) => i.customId === 'confirm-delete' || i.customId === 'cancel-delete';
                        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
                        collector.on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                            if (i.customId === 'confirm-delete') {
                                // @ts-ignore
                                yield row.delete();
                                // @ts-ignore
                                yield interaction.editReply({ content: `Deleted ${interaction.options.getString('word')}`, components: [], embeds: [] });
                            }
                            else if (i.customId === 'cancel-delete') {
                                // @ts-ignore
                                yield interaction.editReply({ content: `Cancelled deletion of ${interaction.options.getString('word')}`, components: [], embeds: [] });
                            }
                        }));
                        collector.on('end', (collected) => __awaiter(this, void 0, void 0, function* () {
                            yield interaction.editReply({ content: "Deletion cancelled.", components: [], embeds: [] });
                        }));
                    }));
                }
            });
            if (!found) {
                yield interaction.editReply({ content: "Word not found.", components: [], embeds: [] });
            }
        });
    },
};
