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
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('transliterate')
        .setDescription('Translate from english to gufijskay jøzik or vice versa')
        .addSubcommand(subcommand => subcommand.setName('english').setDescription('Translate from gufijskay jøzik to english').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('gufijskay').setDescription('Translate from english to gufijskay jøzik').addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true))),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const subcommand = interaction.options.getSubcommand();
            // @ts-ignore
            const text = interaction.options.getString('text');
            const language = subcommand === 'english' ? 'en' : 'gufijskay';
            //await interaction.reply('The language is ' + language + ' and the text is ' + text);
            yield interaction.reply({ content: `${(language === 'en') ? "This command is under construction" : "Ovø šutfaken jest podis aflkonstrukt"}`, ephemeral: true });
        });
    },
};
