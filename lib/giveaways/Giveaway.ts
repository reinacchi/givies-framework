import {
  Client,
  Constants,
  Member,
  Message,
  PossiblyUncachedTextableChannel,
  TextChannel,
  User,
} from "eris";
import { EventEmitter } from "events";
import {
  Endpoints,
  GiveawayEditOptions,
  GiveawayData,
  GiveawayMessages,
  GiveawayRerollOptions,
  LastChanceOptions,
  BonusEntry,
  PauseOptions,
  GiveawaysMessages,
} from "./Constants";
import { RichEmbed } from "../util";
import merge from "deepmerge";
import serialize from "serialize-javascript";

export class Giveaway extends EventEmitter {
  channelID: string;

  client: Client;

  endAt: number;

  ended: boolean;

  endTimeout: NodeJS.Timeout;

  extraData: any;

  guildID: string;

  hostedBy: string;

  manager: any;

  message: Message<PossiblyUncachedTextableChannel>;

  messageID: string;

  messages: GiveawaysMessages;

  options: GiveawayData;

  prize: string;

  startAt: number;

  thumbnail: string;

  winnerCount: number;

  winnerIDs: string[];

  constructor(manager: any, options: GiveawayData) {
    super();

    this.client = manager.client;
    this.channelID = options.channelID;
    this.endAt = options.endAt ?? Infinity;
    this.ended = !!options.ended;
    this.endTimeout = null;
    this.extraData = options.extraData;
    this.hostedBy = options.hostedBy;
    this.guildID = options.guildID;
    this.manager = manager;
    this.message = null;
    this.messageID = options.messageID;
    this.messages = options.messages;
    this.options = options;
    this.prize = options.prize;
    this.startAt = options.startAt;
    this.thumbnail = options.thumbnail;
    this.winnerCount = options.winnerCount;
    this.winnerIDs = options.winnerIDs ?? [];
  }

  get bonusEntries(): BonusEntry[] {
    return eval(this.options.bonusEntries) ?? [];
  }

  get botsCanWin(): boolean {
    return typeof this.options.botsCanWin === "boolean"
      ? this.options.botsCanWin
      : this.manager.options.default.botsCanWin;
  }

  get channel(): TextChannel {
      return this.client.getChannel(this.channelID) as TextChannel;
  }

  get data(): GiveawayData {
    return {
      messageID: this.messageID,
      channelID: this.channelID,
      guildID: this.guildID,
      startAt: this.startAt,
      endAt: this.endAt,
      ended: this.ended,
      winnerCount: this.winnerCount,
      prize: this.prize,
      messages: this.messages,
      thumbnail: this.thumbnail,
      hostedBy: this.hostedBy,
      embedColor: this.embedColor,
      embedColorEnd: this.embedColorEnd,
      botsCanWin: this.botsCanWin,
      exemptPermissions: this.exemptPermissions,
      exemptMembers:
        !this.options.exemptMembers ||
        typeof this.options.exemptMembers === "string"
          ? this.options.exemptMembers || undefined
          : serialize(this.options.exemptMembers),
      bonusEntries:
        !this.options.bonusEntries ||
        typeof this.options.bonusEntries === "string"
          ? this.options.bonusEntries || undefined
          : serialize(this.options.bonusEntries),
      reaction: this.reaction,
      winnerIDs: this.winnerIDs.length ? this.winnerIDs : undefined,
      extraData: this.extraData,
      lastChance: this.options.lastChance,
      pauseOptions: this.options.pauseOptions,
      isDrop: this.options.isDrop || undefined,
    };
  }

  get duration(): number {
    return this.endAt - this.startAt;
  }

  get embedColor(): number {
    return this.options.embedColor ?? this.manager.options.default.embedColor;
  }

  get embedColorEnd(): number {
    return (
      this.options.embedColorEnd ?? this.manager.options.default.embedColorEnd
    );
  }

  get exemptMembersFunction(): any {
    return this.options.exemptMembers
      ? typeof this.options.exemptMembers === "string" &&
        this.options.exemptMembers.includes("function anonymous")
        ? eval(`(${this.options.exemptMembers})`)
        : eval(this.options.exemptMembers)
      : null;
  }

  get exemptPermissions(): [keyof Constants["Permissions"]] {
    return this.options.exemptPermissions?.length
      ? this.options.exemptPermissions
      : this.manager.options.default.exemptPermissions;
  }

  get isDrop(): boolean {
    return !!this.options.isDrop;
  }

  get lastChance(): LastChanceOptions {
    return merge(
      this.manager.options.default.lastChance,
      this.options.lastChance ?? {}
    );
  }

  get messageURL() {
    return Endpoints.MESSAGE_URL(this.guildID, this.channelID, this.messageID);
  }

  get pauseOptions(): PauseOptions {
    return merge(PauseOptions, this.options.pauseOptions ?? {});
  }

  get reaction(): string {
    return this.reaction ?? this.manager.options.default.reaction;
  }

  get remainingTime(): number {
    return this.endAt - Date.now();
  }

  async checkBonusEntries(user: User): Promise<void> {
    const member: Member = this.channel.guild.members.get(user.id) || (await this.channel.guild.fetchMembers({ userIDs: [user.id] }).catch(() => {}))[0];
    const entries: number[] = [];
    const cumulativeEntries: number[] = [];

    if (this.bonusEntries.length) {
      for (const obj of this.bonusEntries) {
        if (typeof obj.bonus === "function") {
          try {
            const result = await obj.bonus(member);
            if (Number.isInteger(result) && result > 0) {
              if (obj.cumulative) {
                cumulativeEntries.push(result);
              } else {
                entries.push(result);
              }
            }
          } catch (err) {
            throw new Error(`Giveaway Message ID: ${this.messageID} \n ${serialize(obj.bonus)} \n ${err}`);
          }
        }
      }
    }
  }

  async checkWinnerEntry(user: User) {
      if (this.winnerIDs.includes(user.id)) return false;
      const member: Member = this.channel.guild.members.get(user.id) || (await this.channel.guild.fetchMembers({ userIDs: [user.id] }).catch(() => {}))[0];
      if (!member) return false;
      const exemptMember = await this.exemptMembers(member);
      if (exemptMember) return false;
      const hasPermission = this.exemptPermissions.some((permission) => member.permissions.has((permission)));
      if (hasPermission) return false;
      return true;
  }

  ensureEndTimeout(): NodeJS.Timeout {
    if (this.endTimeout) return;
    /* eslint-disable-next-line */
    if (this.remainingTime > (this.manager.options.forceUpdateEvery) || 15_000) return;
    /* eslint-disable-next-line */
    this.endTimeout = setTimeout(() => this.manager.end.call(this.manager, this.messageID).catch(() => {}), this.remainingTime);
  }

  async exemptMembers(member: Member): Promise<boolean> {
    if (typeof this.exemptMembersFunction === "function") {
      try {
        const result = await this.exemptMembersFunction(member);
        return result;
      } catch (err) {
        new Error(
          `Giveaway Message ID: ${this.messageID} \n ${serialize(
            this.exemptMembersFunction
          )} \n ${err}`
        );
        return false;
      }
    }

    if (typeof this.manager.options.default.exemptMembers === "function") {
      return await this.manager.options.default.exemptMembers(member);
    }

    return false;
  }

  async fetchMessage(): Promise<Message> {
      return new Promise(async (resolve, reject) => {
        if (!this.messageID) return;
        const message = this.channel.messages.get(this.messageID) || (await this.channel.getMessage(this.messageID).catch(() => {}));
        if (!message) {
            this.manager.giveaways = this.manager.giveaways.filter((g) => g.messageID !== this.messageID);
            await this.manager.deleteGiveaway(this.messageID);
            return reject(`Unable to fetch Message ID: ${this.messageID}`);
        }
        this.message = message;
        resolve(message);
      });
  }

  fillInEmbed(embed: RichEmbed): RichEmbed | null {
    if (!embed || typeof embed !== "object") return null;
    embed = new RichEmbed(embed);
    embed.title = this.fillInString(embed.title);
    embed.description = this.fillInString(embed.description);
    if (typeof embed.author?.name === "string") embed.author.name = this.fillInString(embed.author.name);
    if (typeof embed.footer?.text === 'string') embed.footer.text = this.fillInString(embed.footer.text);
    embed.spliceFields(0, embed.fields.length, embed.fields.map((field) => {
        field.name = this.fillInString(field.name);
        field.value = this.fillInString(field.value);
        return field;
    }));
    return embed;
  }

  fillInString(text: string): string | null {
    if (typeof text !== "string") return null;
    [...new Set(text.match(/\{[^{}]*(?:[^{}]*)*\}/g))].filter((match) => match?.slice(1, -1).trim() !== "").forEach((match) => {
      let replacer;

      try {
        replacer = eval(match.slice(1, -1));
      } catch (err) {
        replacer = match;
      }

      text = text.replaceAll(match, replacer);
    });
    return text;
  }
}
