import {
    Embed,
    EmbedAuthor,
    EmbedField,
    EmbedFooter,
    EmbedImage,
    EmbedOptions,
} from "eris";
import { Util } from "./Util";

const HEX_REGEX = /^#?([a-fA-F0-9]{6})$/;
const URL_REGEX =
    /^http(s)?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

export class RichEmbed {
    author: EmbedAuthor;

    color: number;

    description: string;

    fields: EmbedField[];

    footer: EmbedFooter;

    image: EmbedImage;

    thumbnail: EmbedImage;

    timestamp: Date | string;

    title: string;

    url: string;

    /**
     * @param {EmbedOptions} data
     */
    constructor(data: EmbedOptions = {}) {
        if (data.title) this.title = data.title;
        if (data.description) this.description = data.description;
        if (data.url) this.url = data.url;
        if (data.timestamp) this.timestamp = data.timestamp;
        if (data.color) this.color = data.color;
        if (data.footer) this.footer = data.footer;
        if (data.image) this.image = data.image;
        if (data.thumbnail) this.thumbnail = data.thumbnail;
        if (data.author) this.author = data.author;
        this.fields = data.fields || [];
    }

    get length() {
        return (
            (this.title?.length ?? 0) +
            (this.description?.length ?? 0) +
            (this.fields.length >= 1
                ? this.fields.reduce((prev, curr) => prev + curr.name.length + curr.value.length, 0)
                : 0) +
            (this.footer?.text.length ?? 0) +
            (this.author?.name.length ?? 0)
        );
    }

    addField(name: string, value: string, inline = false) {
        if (this.fields.length >= 25)
            throw new RangeError("Embeds cannot contain more than 25 fields");
        if (typeof name !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof name}`
            );
        if (typeof value !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof value}`
            );
        if (typeof inline !== "boolean")
            throw new TypeError(
                `Expected type 'boolean', received type ${typeof inline}`
            );
        if (name.length > 256)
            throw new RangeError("Embed field names cannot exceed 256 characters");
        if (value.length > 1024)
            throw new RangeError(
                "Embed field descriptions cannot exceed 1024 characters"
            );

        this.fields.push({ name, value, inline });
        return this;
    }

    /**
     * Check if this embed is equal to another embed by comparing every single one of their properties
     * @param embed The embed to compare with
     */
    equals(embed: Embed) {
        return (
            this.author?.name === embed.author?.name &&
            this.author?.url === embed.author?.url &&
            this.author?.icon_url === (embed.author?.icon_url ?? embed.author?.icon_url) &&
            this.color === embed.color &&
            this.title === embed.title &&
            this.description === embed.description &&
            this.url === embed.url &&
            this.timestamp === embed.timestamp &&
            this.fields.length === embed.fields.length &&
            this.fields.every((field, i) => this._fieldEquals(field, embed.fields[i])) &&
            this.footer?.text === embed.footer?.text &&
            this.footer?.icon_url === (embed.footer?.icon_url ?? embed.footer?.icon_url) &&
            this.image?.url === embed.image?.url &&
            this.thumbnail?.url === embed.thumbnail?.url
        );
    }

    normalizeField(name: string, value: string, inline = false) {
        return {
            name: Util.verifyString(name, RangeError, 'EMBED_FIELD_NAME', false),
            value: Util.verifyString(value, RangeError, 'EMBED_FIELD_VALUE', false),
            inline,
        };
    }

    normalizeFields(...fields) {
        return fields
            .flat(2)
            .map(field =>
                this.normalizeField(field.name, field.value, typeof field.inline === 'boolean' ? field.inline : false),
            );
    }

    setAuthor(name: string, url?: string, iconURL?: string) {
        if (typeof name !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof name}`
            );
        if (name.length > 256)
            throw new RangeError("Embed author names cannot exceed 256 characters");
        this.author = { name };

        if (url !== undefined) {
            if (typeof url !== "string")
                throw new TypeError(
                    `Expected type 'string', received type '${typeof url}'`
                );
            if (!URL_REGEX.test(url)) throw new Error("Not a well formed URL");
            this.author.url = url;
        }

        if (iconURL !== undefined) {
            if (typeof iconURL !== "string")
                throw new TypeError(
                    `Expected type 'string', received type '${typeof iconURL}'`
                );
            if (!iconURL.startsWith("attachment://") && !URL_REGEX.test(iconURL))
                throw new Error("Not a well formed URL");
            this.author.icon_url = iconURL;
        }

        return this;
    }

    setColor(color: string | number) {
        if (typeof color !== "string" && typeof color !== "number")
            throw new TypeError(
                `Expected types 'string' or 'number', received type ${typeof color} instead`
            );

        if (typeof color === "number") {
            if (color > 16777215 || color < 0) throw new RangeError("Invalid color");
            this.color = color;
        } else {
            const match = color.match(HEX_REGEX);
            if (!match) throw new Error("Invalid color");
            this.color = parseInt(match[1], 16);
        }

        return this;
    }

    setDescription(description: string) {
        if (typeof description !== "string")
            throw new TypeError(
                `Expected type 'string', received type '${typeof description}'`
            );
        if (description.length > 4096)
            throw new RangeError("Embed descriptions cannot exceed 4096 characters");
        this.description = description;
        return this;
    }

    setFooter(text: string, iconURL: string = undefined) {
        if (typeof text !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof text}`
            );
        if (text.length > 2048)
            throw new RangeError("Embed footer texts cannot exceed 2048 characters");
        this.footer = { text };

        if (iconURL !== undefined) {
            if (typeof iconURL !== "string")
                throw new TypeError(
                    `Expected type 'string', received type '${typeof iconURL}'`
                );
            if (!iconURL.startsWith("attachment://") && !URL_REGEX.test(iconURL))
                throw new Error("Not a well formed URL");
            this.footer.icon_url = iconURL;
        }

        return this;
    }

    setImage(imageURL: string) {
        if (typeof imageURL !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof imageURL}`
            );
        if (!imageURL.startsWith("attachment://") && !URL_REGEX.test(imageURL))
            throw new Error("Not a well formed URL");
        this.image = { url: imageURL };
        return this;
    }

    setThumbnail(thumbnailURL: string) {
        if (typeof thumbnailURL !== "string")
            throw new TypeError(
                `Expected type 'string', received type ${typeof thumbnailURL}`
            );
        if (
            !thumbnailURL.startsWith("attachment://") &&
            !URL_REGEX.test(thumbnailURL)
        )
            throw new Error("Not a well formed URL");
        this.thumbnail = { url: thumbnailURL };
        return this;
    }

    setTimestamp(timestamp: Date | number = new Date()) {
        if (Number.isNaN(new Date(timestamp).getTime()))
            throw new Error("Invalid Date");
        this.timestamp = new Date(timestamp);
        return this;
    }

    setTitle(title: string) {
        if (typeof title !== "string")
            throw new TypeError(
                `Expected type 'string', received type '${typeof title}'`
            );
        if (title.length > 256)
            throw new RangeError("Embed titles cannot exceed 256 characters");
        this.title = title;
        return this;
    }

    setURL(url: string) {
        if (typeof url !== "string")
            throw new TypeError(
                `Expected type 'string', received type '${typeof url}'`
            );
        if (!URL_REGEX.test(url)) throw new Error("Not a well formed URL");
        this.url = url;
        return this;
    }

    spliceFields(index: number, deleteCount: number, ...fields: any) {
        this.fields.splice(index, deleteCount, ...this.normalizeFields(...fields));
    }

    /**
     * Compares two given embed field to check whether they are equal
     * @param field The first field
     * @param otherField The second field
     * @ignore
     */
    private _fieldEquals(field: EmbedField, otherField: EmbedField) {
        return field.name === otherField.name && field.value === otherField.value && field.inline === otherField.inline;
    }
}
