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
function translate(words, word, language) {
    return __awaiter(this, void 0, void 0, function* () {
        let found = false;
        let translatedWord = "";
        yield words.forEach((row) => {
            // @ts-ignore
            let data = row["_rawData"];
            let searchableData = [data[0], data[1]];
            word = word.replace("ing", "").replace("ed", "");
            // @ts-ignore
            if (searchableData[0].toLowerCase() === word.toLowerCase() || searchableData[1].toLowerCase() === word.toLowerCase()) {
                found = true;
                translatedWord = searchableData[(language === "en") ? 1 : 0];
            }
        });
        let toReturn = [translatedWord, found];
        if (!found) {
            toReturn[0] = word;
        }
        return toReturn;
    });
}
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate from english to gufijskay jøzik or vice versa')
        .addSubcommand(subcommand => subcommand.setName('gufijskay').setDescription('Translate from gufijskay jøzik to english').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('english').setDescription('Translate from english to gufijskay jøzik').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true))),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const doc = new google_spreadsheet_1.GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
            yield doc.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            yield doc.loadInfo();
            const sheet = doc.sheetsByTitle['Dictionary'];
            const rows = yield sheet.getRows();
            // @ts-ignore
            const subcommand = interaction.options.getSubcommand();
            // @ts-ignore
            let text = interaction.options.getString('text');
            const language = subcommand === 'english' ? 'gufijskay' : 'en';
            let gufijskayPronouns = ["ja jestem", "ty jesteš", "on jest", "ona jest", "ono jest", "my jestemo", "ony jestu"];
            let englishPronouns = ["i am", "you are", "he is", "she is", "it is", "we are", "they are"];
            let punctuation = text.slice(-1);
            let punctuationFound = false;
            if (punctuation === "." || punctuation === "?" || punctuation === "!") {
                punctuationFound = true;
                text = text.slice(0, -1);
            }
            if (language == "gufijskay") {
                englishPronouns.forEach((pronoun, index) => {
                    if (text.toLowerCase().includes(pronoun)) {
                        text = text.toLowerCase().replace(pronoun, gufijskayPronouns[index].replace(" ", "*"));
                    }
                });
            }
            else {
                gufijskayPronouns.forEach((pronoun, index) => {
                    if (text.toLowerCase().includes(pronoun)) {
                        text = text.toLowerCase().replace(pronoun, englishPronouns[index].replace(" ", "*"));
                    }
                });
            }
            const words = text.split(" ");
            const translatedWords = [];
            // translate each word
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                if (word == "a" || word == "an") {
                    continue;
                }
                if (word.includes("*")) {
                    translatedWords.push([word, true]);
                    continue;
                }
                if (word.includes("-")) {
                    yield translate(rows, word.replace("-", " "), language).then((translatedWord) => {
                        translatedWords.push(translatedWord);
                    });
                    continue;
                }
                const translatedWord = yield translate(rows, word, language);
                translatedWords.push(translatedWord);
            }
            // make a sentance that is the translated words seperated by spaces and add a period at the end if there isn't one already also make the first letter uppercase abd the rest lowercase
            let translatedText = translatedWords.map(word => word[0]).join(' ').replace("*", " ").replace("  ", " ");
            if (punctuationFound) {
                translatedText += punctuation;
            }
            translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1).toLowerCase();
            // check if any of the words were not found
            let embeds = [];
            const notFound = translatedWords.filter(word => word[1] == false);
            if (notFound.length > 0) {
                embeds.push(new discord_js_1.EmbedBuilder()
                    .setTitle('Some words were not found')
                    .setColor(0xFF0000)
                    .setDescription('The following words were not found in the dictionary: ' + notFound.map(word => word[0]).join(', ')));
            }
            // create the embed
            embeds.push(new discord_js_1.EmbedBuilder()
                .setTitle(`Translation from ${language === 'en' ? 'gufijskay jøzik' : 'english'}`)
                .setDescription(translatedText)
                .setColor(0x00AE86)
                .setFooter({ text: `Translated by ${interaction.user.username}` }));
            yield interaction.editReply({ embeds: embeds });
        });
    },
};
