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
        .setName('search')
        .setDescription('Search for a word in gufijskay jøzik')
        .addStringOption(option => option.setName('word').setDescription('The word to search for').setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            yield doc.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            yield doc.loadInfo();
            const sheet = doc.sheetsByTitle["Cave man Gufijskay"];
            const rows = yield sheet.getRows();
            let results = [];
            yield rows.forEach((row) => {
                // @ts-ignore
                let data = row["_rawData"];
                let searchableData = [data[0], data[1]];
                // @ts-ignore
                if (searchableData.toString().toLowerCase().includes(interaction.options.getString('word'))) {
                    results = [...results, data];
                }
            });
            if (!results.length) {
                yield interaction.editReply({ content: `Word not found` });
            }
            else {
                // make pagination embeds using the pagination package
                let embedsArray = [];
                var i, j, temporary, chunk = 5;
                for (i = 0, j = results.length; i < j; i += chunk) {
                    temporary = results.slice(i, i + chunk);
                    // @ts-ignore
                    const newEmbed = new discord_js_1.EmbedBuilder().setTitle(`Results for ${interaction.options.getString('word')}`).setDescription("Here are the results for your search").setColor(0x00ff00).setFooter({ text: `Page ${i / chunk + 1} of ${Math.ceil(results.length / chunk)}` });
                    for (const result of temporary) {
                        newEmbed.addFields({ name: result[0], value: `${result[1]} ${(result[2]) ? `- ${result[2]}` : ""}`, inline: false });
                    }
                    embedsArray.push(newEmbed);
                }
                let button1 = new discord_js_1.ButtonBuilder().setCustomId('nextbtn').setLabel('Next').setStyle(discord_js_1.ButtonStyle.Primary);
                let button2 = new discord_js_1.ButtonBuilder().setCustomId('backbtn').setLabel('Start').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true);
                // make action row with the buttons
                let actionRow = new discord_js_1.ActionRowBuilder().addComponents(button1, button2);
                if (embedsArray.length > chunk) {
                    // @ts-ignore
                    yield interaction.editReply({ embeds: [embedsArray[0]], components: [actionRow], fetchReply: true }).then((msg) => __awaiter(this, void 0, void 0, function* () {
                        // collect the buttons
                        const filter = (button) => __awaiter(this, void 0, void 0, function* () {
                            if (button.user.id === interaction.user.id) {
                                return true;
                            }
                            else {
                                yield button.reply({ content: 'You cannot use this button', ephemeral: true });
                                return false;
                            }
                        });
                        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
                        let currentPage = 0;
                        collector.on('collect', (b) => __awaiter(this, void 0, void 0, function* () {
                            if (b.customId === 'nextbtn') {
                                if (currentPage < embedsArray.length - 1) {
                                    // check if current page is the last page
                                    if (currentPage === embedsArray.length - 2) {
                                        // if it is, change the button to say finish
                                        button1.setLabel('Finish').setDisabled(true);
                                    }
                                    // change the back button to say back
                                    button2.setLabel('Back').setDisabled(false);
                                    currentPage++;
                                    collector.resetTimer({ time: 60000 });
                                    // @ts-ignore
                                    yield b.update({ embeds: [embedsArray[currentPage]], components: [actionRow] });
                                }
                            }
                            else {
                                if (currentPage !== 0) {
                                    // check if current page is the first page
                                    if (currentPage === 1) {
                                        // if it is, change the button to say back
                                        button2.setLabel('Start').setDisabled(true);
                                    }
                                    // change the next button to say next
                                    button1.setLabel('Next').setDisabled(false);
                                    --currentPage;
                                    collector.resetTimer({ time: 60000 });
                                    // @ts-ignore
                                    yield b.update({ embeds: [embedsArray[currentPage]], components: [actionRow] });
                                }
                            }
                        }));
                        collector.on('end', (collected) => __awaiter(this, void 0, void 0, function* () {
                            button1.setDisabled(true);
                            button2.setDisabled(true);
                            // @ts-ignore
                            yield interaction.editReply({ embeds: [embedsArray[currentPage]], components: [actionRow] });
                        }));
                    }));
                }
                else {
                    // @ts-ignore
                    yield interaction.editReply({ embeds: [embedsArray[0]] });
                }
            }
        });
    },
};
