import {
    AdvancedMessageContent,
    Client, 
    Member
} from "eris";
import { EventEmitter } from "events";
import {
    GiveawayData,
    GiveawayManagerOptions,
    GiveawaysManagerOptions
} from "./Constants";
import { Giveaway } from "./Giveaway";
import { RichEmbed } from "../util";
import merge from "deepmerge";
import { writeFile } from "fs/promises";
import serialize from "serialize-javascript";

export class GiveawaysManager extends EventEmitter {
    client: Client;
    giveaways: Giveaway[];
    options: GiveawaysManagerOptions;
    ready: boolean;

    constructor(client: Client, options?: GiveawaysManagerOptions, init = true) {
        super();

        if (!client) {
            throw new Error("Eris Client is required");
        }

        this.client = client;
        this.giveaways = [];
        this.options = merge(GiveawayManagerOptions, options || {});
        this.ready = false;

        if (init) {
            this._init();
        }
    }

    async editGiveaway(messageID: string, giveawayData: GiveawayData) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v): v)
            ),
            "utf-8"
        );
        return;
    }

    end(messageID: string, noWinnerMessage: AdvancedMessageContent | string = null) {
        return new Promise(async (resolve, reject) => {
            const giveaway = this.giveaways.find((g) => g.messageID === messageID);

            if (!giveaway) return reject(`No Giveaway found with message ID ${messageID}`);

            giveaway.end(noWinnerMessage).then((winners) => {
                this.emit("giveawayEnded", giveaway, winners);
                resolve(winners);
            }).catch(reject);
        });
    }

    async deleteGiveaway(messageID: string) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v): v)
            ),
            "utf-8"
        );
        return;
    }

    generateMainEmbed(giveaway: Giveaway, lastChanceEnabled = false): RichEmbed {
        const embed = new RichEmbed()
            .setTitle(giveaway.prize)
            .setColor(giveaway.isDrop ? giveaway.embedColor : giveaway.pauseOptions.isPaused && giveaway.pauseOptions.embedColor ? giveaway.pauseOptions.embedColor : lastChanceEnabled ? giveaway.lastChance.embedColor : giveaway.embedColor)
            .setFooter(typeof giveaway.messages.embedFooter === "object" ? giveaway.messages.embedFooter.text : giveaway.messages.embedFooter, typeof giveaway.messages.embedFooter === "object" ? giveaway.messages.embedFooter.iconURL : undefined)
            .setDescription(
                giveaway.isDrop
                    ? giveaway.messages.dropMessage
                    : (giveaway.pauseOptions.isPaused
                        ? giveaway.pauseOptions.content + "\n\n"
                        : lastChanceEnabled
                            ? giveaway.lastChance.content + "\n\n"
                            : "") +
                    giveaway.messages.inviteToParticipate +
                    "\n" +
                    giveaway.messages.drawing.replace(
                        "{timestamp}",
                        giveaway.endAt === Infinity
                            ? giveaway.pauseOptions.infiniteDurationText
                            : `<t:${Math.round(giveaway.endAt / 1000)}:R>`
                    ) +
                    (giveaway.hostedBy ? "\n" + giveaway.messages.hostedBy : "")
            )
            .setThumbnail(giveaway.thumbnail);

        if (giveaway.endAt !== Infinity) {
            embed.setTimestamp(giveaway.endAt);
        } else {
            delete embed.timestamp;
        }

        return giveaway.fillInEmbed(embed);
    }

    generateEndEmbed(giveaway: Giveaway, winners: Member[]): RichEmbed {
        let formattedWinners = winners.map((w) => `${w}`).join(", ");

        const strings = {
            winners: giveaway.fillInString(giveaway.messages.winners),
            hostedBy: giveaway.fillInString(giveaway.messages.hostedBy),
            endedAt: giveaway.fillInString(giveaway.messages.endedAt),
            prize: giveaway.fillInString(giveaway.prize)
        };

        const descriptionString = (formattedWinners) =>
            strings.winners + " " + formattedWinners + (giveaway.hostedBy ? "\n" + strings.hostedBy : "");

        for (
            let i = 1;
            descriptionString(formattedWinners).length > 4096 ||
            strings.prize.length + strings.endedAt.length + descriptionString(formattedWinners).length > 6000;
            i++
        ) {
            formattedWinners = formattedWinners.slice(0, formattedWinners.lastIndexOf(", <@")) + `, ${i} more`;
        }

        return new RichEmbed()
            .setTitle(strings.prize)
            .setColor(giveaway.embedColorEnd)
            .setFooter(strings.endedAt, (giveaway.messages.embedFooter as { text?: string, iconURL?: string }).iconURL)
            .setTimestamp(giveaway.endAt)
            .setThumbnail(giveaway.thumbnail);
    }

    generateInvalidParticipantsEndEmbed(giveaway: Giveaway): RichEmbed {
        const embed = new RichEmbed()
            .setTitle(giveaway.prize)
            .setColor(giveaway.embedColorEnd)
            .setFooter(giveaway.messages.endedAt, (giveaway.messages.embedFooter as { text?: string, iconURL?: string }).iconURL)
            .setDescription(giveaway.messages.noWinner + (giveaway.hostedBy ? "\n" + giveaway.messages.hostedBy : ""))
            .setTimestamp(giveaway.endAt)
            .setThumbnail(giveaway.thumbnail);

        return giveaway.fillInEmbed(embed);
    }

    async saveGiveaway(messageID: string, giveawayData: GiveawayData) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v): v)
            ),
            "utf-8"
        );
        return;
    }

    async _init() {

    }
}