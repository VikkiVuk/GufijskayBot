import { SlashCommandBuilder } from "@discordjs/builders";
import {CommandInteraction, Embed, EmbedBuilder} from "discord.js";
// @ts-ignore
import {GoogleSpreadsheet} from "google-spreadsheet";

async function translate(words: any, word : string, language: string) {
    let found = false;
    let translatedWord = "";
    await words.forEach((row: string) => {
        // @ts-ignore
        let data = row["_rawData"]
        let searchableData = [ data[0], data[1] ];
        word = word.replace("ing", "").replace("ed", "")

        // @ts-ignore
        if (searchableData[0].toLowerCase() === word.toLowerCase() || searchableData[1].toLowerCase() === word.toLowerCase()) {
            found = true
            translatedWord = searchableData[(language === "en") ? 1 : 0]
        }
    });

    let toReturn = [translatedWord, found]

    if (!found) {
        toReturn[0] = word
    }

    return toReturn
}
export = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate from english to gufijskay jøzik or vice versa')
        .addSubcommand(subcommand => subcommand.setName('gufijskay').setDescription('Translate from gufijskay jøzik to english').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('english').setDescription('Translate from english to gufijskay jøzik').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true))),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Dictionary'];
        const rows = await sheet.getRows();
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
            })
        } else {
            gufijskayPronouns.forEach((pronoun, index) => {
                if (text.toLowerCase().includes(pronoun)) {
                    text = text.toLowerCase().replace(pronoun, englishPronouns[index].replace(" ", "*"));
                }
            })
        }

        const words = text.split(" ")
        const translatedWords = [];

        // translate each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            if (word == "a" || word == "an") { continue; }

            if (word.includes("*")) {
                translatedWords.push([word, true])
                continue;
            }

            if (word.includes("-")) {
                await translate(rows, word.replace("-", " "), language).then((translatedWord) => {
                    translatedWords.push(translatedWord);
                })
                continue;
            }

            const translatedWord = await translate(rows, word, language);
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
            embeds.push(new EmbedBuilder()
                .setTitle('Some words were not found')
                .setColor(0xFF0000)
                .setDescription('The following words were not found in the dictionary: ' + notFound.map(word => word[0]).join(', ')));
        }

        // create the embed
        embeds.push(new EmbedBuilder()
            .setTitle(`Translation from ${language === 'en' ? 'gufijskay jøzik' : 'english'}`)
            .setDescription(translatedText)
            .setColor(0x00AE86)
            .setFooter({ text: `Translated by ${interaction.user.username}`}));

        await interaction.editReply({ embeds: embeds });
    },
};

