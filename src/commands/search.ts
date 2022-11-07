import { JSONEncodable, SlashCommandBuilder} from "@discordjs/builders";
import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
    ActionRowBuilder,
    APIEmbed, ButtonComponent, ButtonInteraction, CollectorFilter
} from "discord.js";
// @ts-ignore
import {GoogleSpreadsheet} from "google-spreadsheet";
import {Pagination} from "discordjs-button-embed-pagination";

export = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a word in gufijskay jøzik')
        .addStringOption(option => option.setName('word').setDescription('The word to search for').setRequired(true)),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const doc = new GoogleSpreadsheet(process.env.CAVEMEN_WORDS_SID);
        await doc.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["Cave man Gufijskay"];
        const rows = await sheet.getRows();
        let results: any[] = [];
        await rows.forEach((row: string) => {
            // @ts-ignore
            let data = row["_rawData"]
            let searchableData = [data[0], data[1]]
            // @ts-ignore
            if (searchableData.toString().toLowerCase().includes(interaction.options.getString('word'))) {
                results = [...results, data];
            }
        });
        if (!results.length) {
            await interaction.editReply({content: `Word not found`});
        } else {
            // make pagination embeds using the pagination package
            let embedsArray: (APIEmbed | JSONEncodable<APIEmbed>)[] = []

            var i,j, temporary, chunk = 5;
            for (i = 0,j = results.length; i < j; i += chunk) {
                temporary = results.slice(i, i + chunk);
                // @ts-ignore
                const newEmbed = new EmbedBuilder().setTitle(`Results for ${interaction.options.getString('word')}`).setDescription("Here are the results for your search").setColor(0x00ff00).setFooter({ text: `Page ${i / chunk + 1} of ${Math.ceil(results.length / chunk)}` });

                for (const result of temporary) {
                    newEmbed.addFields({ name: result[0], value: `${result[1]} ${(result[2]) ? `- ${result[2]}` : ""}`, inline: false });
                }

                embedsArray.push(newEmbed)
            }

            let button1 = new ButtonBuilder().setCustomId('nextbtn').setLabel('Next').setStyle(ButtonStyle.Primary)
            let button2 = new ButtonBuilder().setCustomId('backbtn').setLabel('Start').setStyle(ButtonStyle.Secondary).setDisabled(true)

            // make action row with the buttons
            let actionRow = new ActionRowBuilder().addComponents(button1, button2)
            if (embedsArray.length > chunk) {
                // @ts-ignore
                await interaction.editReply({ embeds: [embedsArray[0]], components: [actionRow], fetchReply: true }).then(async (msg) => {
                  // collect the buttons
                    const filter : CollectorFilter<any> = async (button : ButtonInteraction) => {
                        if (button.user.id === interaction.user.id) {
                            return true
                        } else {
                            await button.reply({ content: 'You cannot use this button', ephemeral: true })
                            return false
                        }
                    };
                    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
                    let currentPage = 0;
                    collector.on('collect', async (b: ButtonInteraction) => {
                        if (b.customId === 'nextbtn') {
                            if (currentPage < embedsArray.length - 1) {
                                // check if current page is the last page
                                if (currentPage === embedsArray.length - 2) {
                                    // if it is, change the button to say finish
                                    button1.setLabel('Finish').setDisabled(true)
                                }

                                // change the back button to say back
                                button2.setLabel('Back').setDisabled(false)

                                currentPage++;
                                collector.resetTimer({ time: 60000 });
                                // @ts-ignore
                                await b.update({embeds: [embedsArray[currentPage]], components: [actionRow]});
                            }
                        } else {
                            if (currentPage !== 0) {
                                // check if current page is the first page
                                if (currentPage === 1) {
                                    // if it is, change the button to say back
                                    button2.setLabel('Start').setDisabled(true)
                                }

                                // change the next button to say next
                                button1.setLabel('Next').setDisabled(false)

                                --currentPage;
                                collector.resetTimer({ time: 60000 });
                                // @ts-ignore
                                await b.update({embeds: [embedsArray[currentPage]], components: [actionRow]});
                            }
                        }
                    })

                    collector.on('end', async (collected) => {
                        button1.setDisabled(true)
                        button2.setDisabled(true)

                        // @ts-ignore
                        await interaction.editReply({embeds: [embedsArray[currentPage]], components: [actionRow]});
                    })
                })
            } else {
                // @ts-ignore
                await interaction.editReply({ embeds: [embedsArray[0]] });
            }
        }
    },
};

