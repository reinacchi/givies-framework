/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    AdvancedMessageContent,
    Client,
    Member,
    Message,
    PossiblyUncachedTextableChannel,
    RawPacket
} from "eris";
import { EventEmitter } from "events";
import {
    GiveawayData,
    GiveawayManagerOptions,
    GiveawaysManagerOptions
} from "./Constants";
import { Giveaway } from "./Giveaway";
import { RichEmbed, Util } from "../utils";
import merge from "deepmerge";
import { access, readFile, writeFile } from "fs/promises";
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

    /**
     * Check every giveaways and update them if necessary
     * @ignore
    */
    private _checkGiveaway() {
        if (this.giveaways.length <= 0) return;

        this.giveaways.forEach(async (giveaway) => {
            // If giveaway is ended, we should first check if it should be deleted from the database
            if (giveaway.ended) {
                if (Number.isFinite(this.options.endedGiveawaysLifetime) && giveaway.endAt + this.options.endedGiveawaysLifetime <= Date.now()) {
                    this.giveaways = this.giveaways.filter((g) => g.messageID === giveaway.messageID);

                    await this.deleteGiveaway(giveaway.messageID);
                }

                return;
            }

            // Check if giveaway is drop and has one reaction
            if (giveaway.isDrop) {
                giveaway.message = await giveaway.fetchMessage().catch(() => { }) as Message<PossiblyUncachedTextableChannel>;

                const reaction = giveaway.message.reactions[giveaway.reaction];

                if (reaction.count - 1 >= giveaway.winnerCount) {
                    return this.end(giveaway.messageID).catch(() => { });
                }
            }

            // Check if giveaway is paused. We should check if it should be unpaused
            if (giveaway.pauseOptions.isPaused) {
                if (!Number.isFinite(giveaway.pauseOptions.unPauseAfter) && !Number.isFinite(giveaway.pauseOptions.durationAfterPause)) {
                    giveaway.options.pauseOptions.durationAfterPause = giveaway.remainingTime;
                    giveaway.endAt = Infinity;

                    await this.editGiveaway(giveaway.messageID, giveaway.data);
                }

                if (Number.isFinite(giveaway.pauseOptions.unPauseAfter) && Date.now() > giveaway.pauseOptions.unPauseAfter) {
                    return; // this.unpause(giveaway.messageID).catch(() => { });
                }
            }

            // Check if giveaway should ended immediately after a restart session
            if (giveaway.remainingTime <= 0) {
                return this.end(giveaway.messageID).catch(() => { });
            }

            giveaway.ensureEndTimeout();

            // Check if giveaway will be in the last chance state
            if (giveaway.lastChance && giveaway.remainingTime - giveaway.lastChance.threshold < (this.options.forceUpdateEvery)) {
                setTimeout(async () => {
                    giveaway.message ??= await giveaway.fetchMessage().catch(() => { }) as Message<PossiblyUncachedTextableChannel>;

                    const embed = this.generateMainEmbed(giveaway, true);

                    giveaway.message = await giveaway.message?.edit({
                        content: giveaway.fillInString(giveaway.messages.giveaway),
                        embed: embed
                    }).catch(() => { }) as Message<PossiblyUncachedTextableChannel>;
                }, giveaway.remainingTime - giveaway.lastChance.threshold);
            }

            // Fetch the giveaway's message if necessary to ensure everthing is in order
            giveaway.message ??= await giveaway.fetchMessage().catch(() => { }) as Message<PossiblyUncachedTextableChannel>;

            if (!giveaway.message) return;

            if (!giveaway.message.embeds[0]) {
                giveaway.message = await giveaway.message.edit({ flags: 0 }).catch(() => { }) as Message<PossiblyUncachedTextableChannel>;
            }

            // Regular check if giveaway is not ended and required to update it
            const lastChanceEnabled = giveaway.lastChance.enabled && giveaway.remainingTime < giveaway.lastChance.threshold;
            const updatedEmbed = this.generateMainEmbed(giveaway, lastChanceEnabled);
            const requireUpdate = !updatedEmbed.equals(giveaway.message.embeds[0]) || giveaway.message.content !== giveaway.fillInString(giveaway.messages.giveaway);

            if (requireUpdate || this.options.forceUpdateEvery) {
                giveaway.message = await giveaway.message.edit({
                    content: giveaway.fillInString(giveaway.messages.giveaway),
                    embed: updatedEmbed
                }).catch(() => { }) as Message<PossiblyUncachedTextableChannel>;
            }
        });
    }

    /**
     * Handle Discord raw gateway events
     * @param packet Discord's Gateway payload packet
     * @ignore
     */
    private async _handleRawPacket(packet: RawPacket): Promise<boolean> {
        if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)) return;

        const giveaway = this.giveaways.find((g) => g.messageID === (packet.d as any).message_id as string);

        if (!giveaway) return;
        if (giveaway.ended && packet.t === "MESSAGE_REACTION_REMOVE") return;

        const guild = this.client.guilds.get((packet.d as any).guild_id);

        if (!guild) return;

        const member: Member = guild.members.get((packet.d as any).user_id) || (await guild.fetchMembers({ userIDs: [(packet.d as any).user_id] }).catch(() => { }))[0];

        if (!member) return;

        const channel = this.client.getChannel((packet.d as any).channel_id) || guild.channels.get((packet.d as any).channel_id);

        if (!channel) return;

        const message = await this.client.getMessage(channel.id, (packet.d as any).message_id);

        if (!message) return;

        const rawEmoji = Util.resolvePartialEmoji(giveaway.reaction);
        const reaction = message.reactions[giveaway.reaction];

        if (!reaction) return;
        if ((rawEmoji as { animated: boolean; name: string; id: string })?.name !== (packet.d as any).emoji_name) return;
        if (rawEmoji?.id && rawEmoji?.id !== (packet.d as any).emoji_id) return;

        if (packet.t === "MESSAGE_REACTION_ADD") {
            if (giveaway.ended) return this.emit("endedGiveawayReactionAdded", giveaway, member, reaction, rawEmoji);

            this.emit("giveawayReactionAdded", giveaway, member, reaction, rawEmoji);

            if (giveaway.isDrop && reaction.count - 1 >= giveaway.winnerCount) {
                this.end(giveaway.messageID).catch(() => { });
            }
        } else {
            this.emit("giveawayReactionRemoved", giveaway, member, reaction, rawEmoji);
        }
    }

    /**
     * Initialize the Giveaway manager
     * @ignore
     */
    private async _init(): Promise<void> {
        const rawGiveaways = await this.getAllGiveaways();

        await (this.client.ready ? Promise.resolve() : new Promise((resolve) => this.client.once("ready", resolve)));

        rawGiveaways.forEach((giveaway) => this.giveaways.push(new Giveaway(this, giveaway)));

        setInterval(() => {
            if (this.client.startTime) this._checkGiveaway.call(this);
        }, this.options.forceUpdateEvery);

        this.ready = true;

        if (Number.isFinite(this.options.endedGiveawaysLifetime)) {
            const endedGiveaways = this.giveaways.filter((g) => g.ended && g.endAt + this.options.endedGiveawaysLifetime <= Date.now());

            this.giveaways = this.giveaways.filter((g) => !endedGiveaways.map((giveaway) => giveaway.messageID).includes(g.messageID));

            for (const giveaway of endedGiveaways) {
                await this.deleteGiveaway(giveaway.messageID);
            }
        }

        this.client.on("rawWS", (packet) => this._handleRawPacket(packet));
    }

    delete(messageID: string, doNotDeleteMessage = false) {
        return new Promise(async (resolve, reject) => {
            const giveaway = this.giveaways.find((g) => g.messageID === messageID);

            if (!giveaway) return reject(`No Giveaway found with message ID ${messageID}`);

            if (!doNotDeleteMessage) {
                giveaway.message ??= await giveaway.fetchMessage().catch(() => { }) as Message<PossiblyUncachedTextableChannel>;
                giveaway.message?.delete();
            }

            this.giveaways = this.giveaways.filter((g) => g.messageID !== messageID);

            await this.deleteGiveaway(messageID);

            this.emit("giveawayDeleted", giveaway);
            resolve(giveaway);

            this.emit;
        });
    }

    async deleteGiveaway(messageID: string) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v) : v)
            ),
            "utf-8"
        );
        return;
    }

    async editGiveaway(messageID: string, giveawayData: GiveawayData) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v) : v)
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
            .setFooter(strings.endedAt, (giveaway.messages.embedFooter as { text?: string; iconURL?: string }).iconURL)
            .setTimestamp(giveaway.endAt)
            .setThumbnail(giveaway.thumbnail);
    }

    generateInvalidParticipantsEndEmbed(giveaway: Giveaway): RichEmbed {
        const embed = new RichEmbed()
            .setTitle(giveaway.prize)
            .setColor(giveaway.embedColorEnd)
            .setFooter(giveaway.messages.endedAt, (giveaway.messages.embedFooter as { text?: string; iconURL?: string }).iconURL)
            .setDescription(giveaway.messages.noWinner + (giveaway.hostedBy ? "\n" + giveaway.messages.hostedBy : ""))
            .setTimestamp(giveaway.endAt)
            .setThumbnail(giveaway.thumbnail);

        return giveaway.fillInEmbed(embed);
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

    async getAllGiveaways(): Promise<GiveawayData[]> {
        const storageExists = await access(this.options.storage).then(() => true).catch(() => false);

        if (!storageExists) {
            await writeFile(this.options.storage, "[]", "utf-8");
            return [];
        } else {
            const storageContent = await readFile(this.options.storage, { encoding: "utf-8" });

            if (!storageContent.trim().startsWith("[") || !storageContent.trim().endsWith("]")) {
                console.log(storageContent);
                throw new SyntaxError("The storage file is not property formatted");
            }

            try {
                return await JSON.parse(storageContent, (_, v) =>
                    typeof v === "string" && /BigInt\("(-?\d+)"\)/.test(v) ? eval(v) : v
                );
            } catch (err) {
                if (err.message.startsWith("Unexpected token")) {
                    throw new SyntaxError(
                        /* eslint-disable-next-line */
                        `${err.message} | LINK: (${require("path").resolve(this.options.storage)}:1:${err.message
                            .split(" ")
                            .at(-1)})`
                    );
                }

                throw err;
            }
        }
    }

    async saveGiveaway(messageID: string, giveawayData: GiveawayData) {
        await writeFile(
            this.options.storage,
            JSON.stringify(
                this.giveaways.map((giveaway) => giveaway.data),
                (_, v) => (typeof v === "bigint" ? serialize(v) : v)
            ),
            "utf-8"
        );
        return;
    }
}