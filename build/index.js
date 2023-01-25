"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = __importStar(require("discord.js"));
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, Collection } = require('discord.js');
const DotEnv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
DotEnv.config({ path: "./.env" });
// initialize discord.js client with all the intents and presence set to online and the activity set to competing in the best bot battle
const client = new Discord.Client({ intents: [], presence: { status: "online", afk: false, activities: [{ name: "gufijskay", type: Discord.ActivityType.Listening }] } });
// discord slash command collection
let commands = new Collection();
const commandsPath = path_1.default.join(__dirname, 'commands');
const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path_1.default.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
client.on("ready", () => {
    console.log("Bot is ready!");
});
// run slash commands
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isCommand()) {
        const command = commands.get(interaction.commandName);
        try {
            // @ts-ignore
            yield command.execute(interaction, client);
        }
        catch (error) {
            yield interaction.reply({
                embeds: [new EmbedBuilder().setTitle("Error").setDescription("An error occurred whilst executing this command! You can report this error, but we advise you to try the command later first before reporting.").setColor(Colors.Red).setTimestamp().setFooter({ text: "Wulfie" })],
                components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel("Report this error").setCustomId("report_error").setEmoji("📝"))],
                ephemeral: true,
                fetchReply: true
            }).catch(() => __awaiter(void 0, void 0, void 0, function* () {
                console.error(error);
                yield interaction.editReply({
                    embeds: [new EmbedBuilder().setTitle("Error").setDescription("An error occurred whilst executing this command! The developers were notified automatically.").setColor(Colors.Red).setTimestamp().setFooter({ text: "Wulfie" })]
                });
            })).then(reply => {
                // listen to the button click
                const filter = (buttonInteraction) => buttonInteraction.customId === "report_error" && buttonInteraction.user.id === interaction.user.id;
                // @ts-ignore
                reply.createMessageComponentCollector({ filter, time: 60000 }).catch(() => {
                    // @ts-ignore
                    reply.edit({
                        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel("Report this error").setCustomId("report_error").setEmoji("📝").setDisabled(true))]
                    });
                }).then((collector) => {
                    collector.on('collect', (buttonInteraction) => __awaiter(void 0, void 0, void 0, function* () {
                        console.error(error);
                        // @ts-ignore
                        yield buttonInteraction.reply({ content: "The developers have been notified of this error.", ephemeral: true });
                    }));
                });
            });
        }
    }
}));
client.login(process.env.TOKEN).then(r => console.log("Logged in!")).catch(e => console.log("Error logging in: " + e));
