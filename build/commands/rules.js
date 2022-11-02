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
        .setName('rules')
        .setDescription('The Rules of the Gufijskay Jøzik'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            yield doc.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            yield doc.loadInfo();
            const sheet = doc.sheetsByTitle["Da rules"];
            const rows = yield sheet.getRows();
            let rules = [];
            yield rows.forEach((row) => {
                // @ts-ignore
                let data = row["_rawData"];
                rules.push(data);
            });
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("The Rules of Gufijskay Jøzik")
                .setColor(0x00AE86)
                .setDescription("The rules of Gufijskay Jøzik are simple. They are as follows:")
                .setFooter({ text: "The rules were created by VikkiVuk#0001 and X Master Woo#5269." });
            for (let i = 0; i < rules.length; i++) {
                embed.addFields({ name: `Rule ${i + 1}`, value: rules[i].toString(), inline: false });
            }
            yield interaction.editReply({ embeds: [embed] });
        });
    },
};
