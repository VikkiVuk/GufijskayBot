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
                if (results.length >= 25) {
                    yield interaction.editReply({ content: `Found ${results.length} results, could not display all of them` });
                    return;
                }
                // loop through results
                let embed = new discord_js_1.EmbedBuilder();
                // @ts-ignore
                embed.setTitle(`Results for ${interaction.options.getString('word')}`).setDescription("Here are the results for your search").setColor(0x00ff00);
                results.forEach((result) => {
                    embed.addFields({ name: result[0], value: `${result[1]} ${(result[2]) ? `- ${result[2]}` : ""}`, inline: false });
                });
                yield interaction.editReply({ embeds: [embed] });
            }
        });
    },
};
