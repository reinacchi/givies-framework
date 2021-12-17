"use strict";

export class Util {
    static verifyString(data: string, error: any, errorMessage = `Expected typeof string, received ${data} instead`, allowEmpty = true) {
        if (typeof data !== "string") throw new error(errorMessage);
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
    }
 }