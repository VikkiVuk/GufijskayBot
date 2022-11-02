import { REST, Routes } from "discord.js"
import * as fs from "fs"
import * as path from "path"

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", file));
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken("MTAzNzA2MjAwODY5ODMyNzA3MA.GNDnO7.3sNejSMJosF37aU0K7ZNriXfYpftU0CJ3Z_VJY");

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands('1037062008698327070'),
            { body: commands },
        );

        // @ts-ignore
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();