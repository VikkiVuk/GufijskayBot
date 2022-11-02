import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('numbers')
        .setDescription('Brujevi (Numbers) of the Gufijskay Jøzik'),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Brujevi (Numbers)"];
        const rows = await sheet.getRows();

        let brujevi: any[] = rows[0]._rawData;
        let numbers: any[] = rows[1]._rawData;

        // make the first letter of each number uppercase
        for (let i = 0; i < numbers.length; i++) {
            numbers[i] = numbers[i].charAt(0).toUpperCase() + numbers[i].slice(1);
        }

        // make the first letter of each brujevi uppercase
        for (let i = 0; i < brujevi.length; i++) {
            brujevi[i] = brujevi[i].charAt(0).toUpperCase() + brujevi[i].slice(1);
        }

        const embed = new EmbedBuilder()
            .setTitle("The Brujevi")
            .setColor(0x00AE86)
            .setDescription("The Brujevi are the numbers of Gufijskay Jøzik. It is a 10 number system, and a word for 100. The numbers are similar to Serbo-croatian and Russian. To for example say 20 you would say dłacdisjat or if you wanted to say 700 you would say sedemstol and so on.")
            .addFields({ name: "Brujevi", value: brujevi.join(" "), inline: false })
            .addFields({ name: "Numbers", value: numbers.join(" "), inline: false })// @ts-ignore
            .setFooter({ text: "The Brujevi were created by VikkiVuk#0001 and X Master Woo#5269."});

        await interaction.editReply({ embeds: [embed] });
    },
};

