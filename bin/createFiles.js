const { resolve } = require("path");
const { writeFileSync } = require('fs')
const res = resolve;

async function createInterfaceFiles({ isGuildCommand }) {
    if (!isGuildCommand) {
        await writeFileSync(res("src/interfaces/Client.ts"), `import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from 'discord.js';
import { CommandType } from '../types/Command';
import glob from 'glob';
import { promisify } from 'util';
import { Event } from './Event';
import chalk from 'chalk'
const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    constructor() {
        super({
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_MESSAGES',
            ]
        });
    }
    start() {
        this.registerModules().then(() => console.log(chalk.cyan(\`[+] ハンドラーモジュールを読み込みました\`)))
        this.login(\`\${process.env.BOT_TOKEN}\`).then(() => console.log(chalk.cyan(\`[+] ログインしました\`)))
    }
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }
    async registerModules() {
        const slashCommands: ApplicationCommandDataResolvable[] = []
        const commandFiles = await globPromise(
            \`\${__dirname}/../commands/*/*{.ts,.js}\`
        );
        for (const filePath of commandFiles) {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) continue;
            console.log(chalk.green(\`[+] /\${command.name}を読み込みました(\${filePath})\`))
            this.commands.set(command.name, command);
            slashCommands.push(command);
        }

        this.on('ready', () => {
            this.guilds.cache.map(guild => guild.id).forEach(guildId => {
                const guild = this.guilds.cache.get(guildId)
                guild?.commands.set(slashCommands).then(() => {
                    console.log(chalk.green(\`[+] \${guild?.name}で\${slashCommands.length}個のスラッシュコマンドを正常に登録しました\`))
                }).catch(async (e) => {
                    console.log(chalk.red(\`[-] \${guild?.name}でスラッシュコマンドの登録に失敗しました\`))
                    console.log(\`=> \${e}\`)
                })
            })
        });

        const eventFiles = await globPromise(
            \`\${__dirname}/../events/*{.ts,.js}\`
        );
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            this.on(event.event, event.run);
        }
    }
}`
        );
    } else {
        writeFileSync(res('src/interfaces/Client.ts'), `import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from 'discord.js';
import { CommandType } from '../types/Command';
import glob from 'glob';
import { promisify } from 'interfaces';
import { Event } from './Event';
import chalk from 'chalk'
const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    constructor() {
        super({
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_MESSAGES',
                'GUILD_VOICE_STATES',
                'GUILD_MESSAGE_REACTIONS'
            ]
        });
    }
    start() {
        this.registerModules().then(() => console.log(chalk.cyan(\`[+] ハンドラーモジュールを読み込みました\`)))
        this.login(\`\${process.env.BOT_TOKEN}\`).then(() => console.log(chalk.cyan(\`[+] ログインしました\`)))
    }
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }
    async registerModules() {
        const slashCommands: ApplicationCommandDataResolvable[] = []
        const commandFiles = await globPromise(
            \`\${__dirname}/../commands/*/*{.ts,.js}\`
        );
        for (const filePath of commandFiles) {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) continue;
            console.log(chalk.green(\`[+] /\${command.name}を読み込みました(\${filePath})\`))
            this.commands.set(command.name, command);
            slashCommands.push(command);
        }

        this.on('ready', () => {
            const guild = client.guilds.cache.get(\${process.env.GUILD_ID})
            guild?.commands.set(slashCommands).then(() => {
                console.log(chalk.green(\`[+] \${guild?.name}で\${slashCommands.length}個のスラッシュコマンドを正常に登録しました\`))
            })
        });

        const eventFiles = await globPromise(
            \`\${__dirname}/../events/*{.ts,.js}\`
        );
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            this.on(event.event, event.run);
        }
    }
}`
        )
    }

    await writeFileSync(res("src/interfaces/Command.ts"), `import { CommandType } from "../types/Command";

export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}`
    )
    await writeFileSync(res("src/interfaces/Event.ts"), `import { ClientEvents } from "discord.js";

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        public run: (...args: ClientEvents[Key]) => any
    ) {}
}`
    )

    await writeFileSync(res("src/events/interactionCreate.ts"), `import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../index";
import { Event } from "../interfaces/Event";
import { ExtendedInteraction } from "../types/Command";
import chalk from 'chalk'
export default new Event("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (command?.name !== '2048' && !command) return
        command?.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        });
        console.log(chalk.bgYellow(\`\${interaction.guild?.name}で/\${command?.name}を実行しました\`))
    }
});`
    )

    await writeFileSync(res("src/events/ready.ts"), `import { Event } from "../interfaces/Event";
import chalk from 'chalk'
import { client } from "../index";

export default new Event("ready", () => {
    console.log(chalk.cyan(\`[+] 起動に成功しました\`))
    client.user?.setPresence({
        activities: [
            {
                name: 'Generated by 𝓡𝓮𝓷𝓪𓈒 𓏸 𓐍 𓂃 𓈒𓏸🌙#8138',
                type: 'PLAYING',
            }
        ],
        afk: false,
        status: 'online'
    })
});`
    )
}

async function createBaseFiles(token, guildId) {
    await writeFileSync(res(".env"), `BOT_TOKEN='${token}'\nGUILD_ID='${guildId}'`, async () => {
        console.log(green(`${success} .envを作成しました`));
    })

    await writeFileSync(res("tsconfig.json"), `{
  "compilerOptions": {
    "lib": [
      "ESNext",
      "DOM"
    ],
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ESNext",
    "outDir": "dist",
    "sourceMap": false,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "resolveJsonModule": true,
    "importHelpers": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true
  },
  "include": [
    "src",
    "src/types/environment.d.ts"
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts"
  ]
}`, async () => {
        console.log(green(`${success} tsconfig.jsonを作成しました`));
    })

    await writeFileSync(res("package.json"), `{
  "name": "rena-bot-builder",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "start": "npm run build ; start:prod",
    "start:dev": "ts-node-dev src/index.ts",
    "start:prod": "node dist/index.js",
    "build": "tsc -p .",
    "watch": "tsc -w"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/glob": "^7.2.0",
    "chalk": "^4.1.2",
    "discord.js": "^13.9.1",
    "dotenv": "^16.0.1",
    "fs": "^0.0.1-security",
    "glob": "^7.2.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^4.7.4"
  }
}
`, async () => {
        console.log(green(`${success} package.jsonを作成しました`));
    })
}

async function createIndex() {
    await writeFileSync(res('src/index.ts'), `require("dotenv").config();
import { ExtendedClient } from "./interfaces/Client";
export const client = new ExtendedClient();
client.start();`)
}

async function createPingCommand() {
    await writeFileSync(res('src/commands/info/ping.ts'), `import { Guild, MessageEmbed } from 'discord.js';
import { client } from '../../index';
import { Command } from '../../interfaces/Command';
export default new Command({
    name: 'ping',
    description: 'Botの応答速度を計測します',
    run: async ({ interaction }) => {
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle('🏓 計測中...')
                    .setColor('AQUA')
                    .setFooter({
                        text: String(client.user?.tag),
                        iconURL: String(client.user?.avatarURL())
                    })
            ]
        })

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle('🏓 Pong!')
                    .setDescription(\`\\\`\\\`\\\`fix\\n[+] Websocketの応答速度は\${client.ws.ping}msです\\n[+] メッセージ編集速度は\${Math.floor(Number(new Date()) - Number(interaction.createdAt))}です\\\`\\\`\\\`\`)
                    .setColor('AQUA')
                    .setFooter({
                        text: String(client.user?.tag),
                        iconURL: String(client.user?.avatarURL())
                    })
            ]
        })
    }
});`)
}

async function createTypeFiles() {
    await writeFileSync(res('src/types/Command.ts'), `import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    PermissionResolvable
} from "discord.js";
import { ExtendedClient } from "../interfaces/Client";

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;`
    )

    await writeFileSync(res('src/types/client.ts'), `import { ApplicationCommandDataResolvable } from "discord.js";

export interface RegisterCommandsOptions {
    guildId?: string;
    commands: ApplicationCommandDataResolvable[];
}`
    )

    await writeFileSync(res('src/types/environment.d.ts'), `declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            GUILD_ID: string;
        }
    }
}

export {};`
    )
}
exports.createBaseFiles = createBaseFiles
exports.createInterfaceFiles = createInterfaceFiles
exports.createIndex = createIndex
exports.createPingCommand = createPingCommand
exports.createTypeFiles = createTypeFiles