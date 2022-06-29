# Givies-Framework

[![Discord Server](https://discord.com/api/guilds/772680478888034324/widget.png?style=shield)](https://discord.gg/22v8peAJp8)
[![CodeFactor](https://www.codefactor.io/repository/github/reinhello/givies-framework/badge)](https://www.codefactor.io/repository/github/reinhello/givies-framework)
[![NPM](https://img.shields.io/npm/v/givies-framework?color=green)](https://npmjs.com/package/givies-framework)
[![Release](https://img.shields.io/github/v/release/reinhello/givies-framework)](https://github.com/reinhello/givies-framework/releases/latest)

A framework to facilitate the development of Discord bots using [Eris](https://github.com/abalabahaha/eris).
## Design Features

This framework includes amazing features such as:

- Giveaways
- Image Manipulations
   - Captcha
- Utility Classes
    - Logger
    - RichEmbed Constructor
    - and more...

## Developing a Discord bot using Givies-Framework

- **Requirement:** You will need **[NodeJS v16.6.0+](https://nodejs.org)** installed.

To start developing a Discord bot, you may first initialize a new NodeJS project and install the necessary dependencies. Here's a simple steps how to get done:

- Initialize a NodeJS project: `npm init -y`
- Install Givies-Framework and Eris: `npm install eris givies-framework`
- Open your project using any suitable code editor

**Code Example:**

Below is a very basic example how it works in JavaScript.

```js
const Eris = require("eris");
const GiviesFramework = require("givies-framework");

const client = new Eris.Client("Bot <BOT_TOKEN>", {
    intents: [
        "guilds",
        "guildMessages"
    ]
});
const captchaImage = new GiviesFramework.Images.Captcha(175, 50, 5);
const captcha = captchaImage.createCaptcha();
const logger = new GiviesFramework.Utils.Logger();

client.on("ready", () => {
    logger.info({ message: `${client.user.username} is Ready`, subTitle: "Discord::Ready", title: "ERIS" });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        const embed = new GiviesFramework.Utils.RichEmbed();
            .setTitle("Bot's ping")
            .setDescription(`Pong! | ${message.member.guild.shard.latency}ms`)
            .setColor(0x7289DA);

        return client.createMessage(message.channel.id, { embed: embed });
    } else if (message.content === "!captcha") {
        return client.createMessage(message.channel.id, {
            content: `Captcha text: ${captcha.text}`
        });
    }
});

client.connect();
```

## Contributing

Any contributions can be made via [pull requests](https://github.com/reinhello/givies-framework/pulls).

If you are confused where to get started, the [issue-tracker](https://github.com/reinhello/givies-framework/issues) is the best place to track any current existing issues.

**Note:** Please make sure to follow its [Contributing Guidelines](https://github.com/reinhello/givies-framework/blob/master/.github/CONTRIBUTING.md) before proceeding.

## License

This framework is released under the [MIT License](https://github.com/reinhello/givies-framework/blob/master/LICENSE).
