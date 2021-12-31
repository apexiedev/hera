import DBD from 'discord-dashboard';
import DarkDashboard from 'dbd-dark-dashboard';
import ExtendedClient from "../Client";
import { Command } from "../Interfaces";
import { Configuration } from "./Modules/Configuration";

export class ClientDashboard {

    public client: ExtendedClient;

    public constructor(client: ExtendedClient) {
        this.client = client;

        let commands = [];
        client.arrayOfCommands.forEach(command => commands.push({
            commandName: command.name,
            commandUsage: "",
            commandDescription: command.description,
            commandAlias: "No Aliases"
        }));

        DBD.Dashboard = DBD.UpdatedClass();

        let urlPort: string;
        if(client.config.dashboard.port === 3000) {urlPort = ":3000"} else urlPort = "";

        const settings = {
            port: client.config.dashboard.port,
            client: {
                id: client.config.clientId,
                secret: client.config.clientSecret
            },
            redirectUri: client.config.dashboard.redirectUri,
            domain: client.config.dashboard.domain,
            bot: client,
            ownerIDs: client.config.owners,
            acceptPrivacyPolicy: true,
            sessionFileStore: true,
            invite: {
                redirectUri: client.config.dashboard.redirectUri,
                permissions: 8,
                clientId: client.config.clientId,
                scopes: [
                    'bot',
                    'application.commands'
                ],
                otherParams: ""
            },
            supportServer: {
                slash: 'support-server',
                inviteUrl: 'https://discord.gg/CNTz9fDYYJ'
            },
            noCreateServer: false,
            guildAfterAuthorization: {
                use: true,
                guildId: '924159913024958505'
            },
            theme: DarkDashboard({
                information: {
                    createdBy: client.config.partnership.brandName,
                    websiteTitle: client.user.username + " - Dashboard",
                    websiteName: client.user.username,
                    websiteUrl: client.config.dashboard.domain + urlPort,
                    dashboardUrl: client.config.dashboard.domain + urlPort,
                    supporteMail: "Sike!",
                    supportServer: "https://discord.gg/CNTz9fDYYJ",
                    imageFavicon: "https://i.imgur.com/PXKhUSB.png",
                    iconURL: "https://i.imgur.com/PXKhUSB.png",
                    pageBackGround: "linear-gradient(#2CA8FF, #155b8d)",
                    mainColor: "#2CA8FF",
                    subColor: "#ebdbdb",
                },
                privacyPolicy: {
                    pp: `<meta http-equiv="refresh" content="0; URL='https://www.iubenda.com/privacy-policy/12305593'" />`
                },
                index: {
                    card: {
                        category: "Plenus - Make everything easier",
                        title: "Plenus is a simple Discord bot that's quick to add and easy to setup.",
                        image: "https://i.imgur.com/ROjAjqv.png",
                    },
                    information: {
                        title: "Information",
                        description: "The bot is made with open source libraries and the bot itself is also free and open source available in a GitHub repository." +
                        "<br>The bot has the following features:<br>" +
                        "- <b>Slash commands</b>, the newest Discord commands implementation<br>" +
                        "- <b>Moderation commands</b>, that makes moderation for everyone easier than it was before<br>" +
                        "- <b>Fun commands</b>, helpful for the chat to not die and to express yourself with the funniest commands<br>" +
                        "- <b>Activity commands</b>, such as YouTube Together and Doodle Crew to entertain yourself and your friends in a voice chat<br>" +
                        "- <b>Administration commands</b>, which help with things like logging, words blacklist and so much more..." +
                        "<br><br>To manage your bot, go to the <a href='/manage'>Server Management page</a>.<br><br>For a list of commands, go to the <a href='/commands'>Commands page</a>."
                    },
                    feeds: {
                        title: "Feeds",
                        list: [
                            {
                                icon: "fa fa-server",
                                text: "Bot released to the public and open-sourced!",
                                timeText: "28/12/2021",
                                bg: "bg-light-danger"
                            }
                        ]
                    }
                },
                commands: [{
                    category: "Commands",
                    subTitle: "All the available commands of the bot",
                    list: commands
                }]
            }),
            settings: this.dashboardSettings()
        }

        const db = new DBD.Dashboard(settings);
        db.init();
    }

    public dashboardSettings() {
        const settings = [
            {
                categoryId: 'config',
                categoryName: 'Configuration',
                categoryDescription: 'The configuration of the bot in your guild.',
                categoryOptionsList: [
                    {
                        optionId: 'logchannel',
                        optionName: 'Logging Channel',
                        optionDescription: 'Change the log channel in your guild',
                        optionType: DBD.formTypes.channelsSelect(false, ['GUILD_TEXT']),
                        getActualSet: async({ guild }) => {
                            return Configuration.getLogChannel(guild);
                        },
                        setNew: async({ guild, newData }) => {
                            try {
                                Configuration.changeLogChannel(newData);
                                return;
                            } catch (e) {
                                return { error: "Can't change log channel." };
                            }
                        }
                    },
                    {
                        optionId: 'autoroles',
                        optionName: 'Auto Roles',
                        optionDescription: 'Choose which roles of your guild need to be added when a new member joins your guild.',
                        optionType: DBD.formTypes.rolesMultiSelect(false, false),
                        getActualSet: async({ guild }) => {
                            return Configuration.getAutoRoles(guild);
                        },
                        setNew: async({ guild, newData }) => {
                            try {
                                Configuration.setAutoRoles(guild, newData);
                                return;
                            } catch (e) {
                                return { error: "Can't set auto roles." };
                            }
                        }
                    }
                ]
            }
        ]
        return settings;
    }

}