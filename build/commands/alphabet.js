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
        .setName('alphabet')
        .setDescription('The Abzłecedy'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            yield doc.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            yield doc.loadInfo();
            const sheet = doc.sheetsByTitle["Abzłecedy (Alphabet)"];
            const rows = yield sheet.getRows();
            let letters = rows[0]._rawData;
            let pronounciations = rows[1]._rawData;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("The Abzłecedy")
                .setColor(0x00AE86)
                .setDescription("The Abzłecedy is the alphabet of Gufijskay Jøzik. It is a 36 letter alphabet. The letters are in order of the Serbo-croatian alphabet, with the exception of the letter 'ć' which doesnt exist in the alphabet.")
                .addFields({ name: "Letters", value: `${letters.join(" ").toUpperCase()} \n ${letters.join(" ")}`, inline: false })
                .addFields({ name: "Pronounciation", value: pronounciations.join(" "), inline: false }) // @ts-ignore
                .setFooter({ text: "The Abzłecedy was created by VikkiVuk#0001 and X Master Woo#5269." });
            yield interaction.editReply({ embeds: [embed] });
        });
    },
};
