import {
  Client,
  Constants,
  Member,
  Message,
  PossiblyUncachedTextableChannel,
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
import merge from "deepmerge";
import serialize from "serialize-javascript";

export class Giveaway extends EventEmitter {
  channelID: string;

  client: Client;

  endAt: number;

  ended: boolean;

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

  get exemptPermissions(): Constants["Permissions"][] {
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
}
