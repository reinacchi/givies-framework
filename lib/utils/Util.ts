"use strict";

/**
 * Represents a static util class to ease on class construction
 */
export class Util {
    /**
     * Copies an object
     * @param obj The object to clone
     * @returns {Object}
     */
    static cloneObject(obj): object {
        return Object.assign(Object.create(obj), obj);
    }

    /**
     * Finds a common element from arrays.
     * @param firstArray The first array to compare
     * @param secondArray The second array to compare
     * @returns {Boolean}
     */
    static findCommonElement(firstArray: string[], secondArray: string[]): boolean {
        for (let i = 0; i < firstArray.length; i++) {
            for (let j = 0; j < secondArray.length; j++) {
                if (firstArray[i] === secondArray[j]) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Parse a emoji from a text
     * @param text The tetx to be parse
     * @returns {Object}
     */
    static parseEmoji(text: string): { animated: boolean; name: string; id: string | null } {
        if (text.includes("%")) {
            text = decodeURIComponent(text);
        }

        if (!text.includes(":")) {
            return { animated: false, name: text, id: null };
        }

        const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
        return match && { animated: Boolean(match[1]), name: match[2], id: match[3] ?? null };
    }

    /**
     * Resove a partial emoji
     * @param emoji The partial emoji
     * @returns {?Object}
     */
    static resolvePartialEmoji(emoji: string): { animated: boolean; name: string; id: string | null } | { id: string | null } {
        if (!emoji) return null;
        if (typeof emoji === "string") return /^\d{17,19}$/.test(emoji) ? { id: emoji } : Util.parseEmoji(emoji);
        const { id, name, animated } = emoji;
        if (!id && !name) return null;
        return { id, name, animated };
    }

    /**
     * Verifies the provided data is a string, otherwise throws provided error
     * @param data The string to resolve
     * @param error The error constructor. Default to `Error`
     * @param errorMessage The error message to throw with
     * @param allowEmpty Whether an empty string should be allowed
     * @returns {String}
     */
    static verifyString(data: string, error: any, errorMessage = `Expected typeof string, received ${data} instead`, allowEmpty = true): string {
        if (typeof data !== "string") throw new error(errorMessage);
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
    }
}
