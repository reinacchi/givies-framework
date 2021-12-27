"use strict";

export class Util {
  static parseEmoji(text: string): { animated: boolean, name: string, id: string | null } {
    if (text.includes("%")) {
      text = decodeURIComponent(text);
    }

    if (!text.includes(":")) {
      return { animated: false, name: text, id: null };
    }

    const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
    return match && { animated: Boolean(match[1]), name: match[2], id: match[3] ?? null };
  }

  static resolvePartialEmoji(emoji: string): { animated: boolean, name: string, id: string | null} | { id: string | null } {
    if (!emoji) return null;
    if (typeof emoji === 'string') return /^\d{17,19}$/.test(emoji) ? { id: emoji } : Util.parseEmoji(emoji);
    const { id, name, animated } = emoji;
    if (!id && !name) return null;
    return { id, name, animated }; 
  }

  static verifyString(data: string, error: any, errorMessage = `Expected typeof string, received ${data} instead`, allowEmpty = true): string {
    if (typeof data !== "string") throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
  }
}