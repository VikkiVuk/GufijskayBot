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
        .setName('numbers')
        .setDescription('Brujevi (Numbers) of the Gufijskay Jøzik'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            yield doc.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            yield doc.loadInfo();
            const sheet = doc.sheetsByTitle["Brujevi (Numbers)"];
            const rows = yield sheet.getRows();
            let brujevi = rows[0]._rawData;
            let numbers = rows[1]._rawData;
            // make the first letter of each number uppercase
            for (let i = 0; i < numbers.length; i++) {
                numbers[i] = numbers[i].charAt(0).toUpperCase() + numbers[i].slice(1);
            }
            // make the first letter of each brujevi uppercase
            for (let i = 0; i < brujevi.length; i++) {
                brujevi[i] = brujevi[i].charAt(0).toUpperCase() + brujevi[i].slice(1);
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("The Brujevi")
                .setColor(0x00AE86)
                .setDescription("The Brujevi are the numbers of Gufijskay Jøzik. It is a 10 number system, and a word for 100. The numbers are similar to Serbo-croatian and Russian. To for example say 20 you would say dłacdisjat or if you wanted to say 700 you would say sedemstol and so on.")
                .addFields({ name: "Brujevi", value: brujevi.join(" "), inline: false })
                .addFields({ name: "Numbers", value: numbers.join(" "), inline: false }) // @ts-ignore
                .setFooter({ text: "The Brujevi were created by VikkiVuk#0001 and X Master Woo#5269." });
            yield interaction.editReply({ embeds: [embed] });
        });
    },
};
