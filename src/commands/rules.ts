import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import { GoogleSpreadsheet } from "google-spreadsheet";

export = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('The Rules of the Gufijskay Jøzik'),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Da rules"];
        const rows = await sheet.getRows();

        let rules: any[] = [];
        await rows.forEach((row: string) => {
            // @ts-ignore
            let data = row["_rawData"]
            rules.push(data);
        })

        const embed = new EmbedBuilder()
            .setTitle("The Rules of Gufijskay Jøzik")
            .setColor(0x00AE86)
            .setDescription("The rules of Gufijskay Jøzik are simple. They are as follows:")
            .setFooter({ text: "The rules were created by VikkiVuk#0001 and X Master Woo#5269."});

        for (let i = 0; i < rules.length; i++) {
            embed.addFields({ name: `Rule ${i + 1}`, value: rules[i].toString(), inline: false })
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

