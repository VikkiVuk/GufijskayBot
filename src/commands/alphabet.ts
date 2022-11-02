import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('alphabet')
        .setDescription('The Abzłecedy'),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Abzłecedy (Alphabet)"];
        const rows = await sheet.getRows();

        let letters = rows[0]._rawData;
        let pronounciations = rows[1]._rawData;

        const embed = new EmbedBuilder()
            .setTitle("The Abzłecedy")
            .setColor(0x00AE86)
            .setDescription("The Abzłecedy is the alphabet of Gufijskay Jøzik. It is a 36 letter alphabet. The letters are in order of the Serbo-croatian alphabet, with the exception of the letter 'ć' which doesnt exist in the alphabet.")
            .addFields({ name: "Letters", value: `${letters.join(" ").toUpperCase()} \n ${letters.join(" ")}`, inline: false })
            .addFields({ name: "Pronounciation", value: pronounciations.join(" "), inline: false })// @ts-ignore
            .setFooter({ text: "The Abzłecedy was created by VikkiVuk#0001 and X Master Woo#5269."});

        await interaction.editReply({ embeds: [embed] });
    },
};

