import chalk from "chalk";
import moment from "moment";

/**
 * Represents a Logger class to facilitate the logging implementation
 */
export class Logger {
    /**
     * Logs a command logging message
     * @param t The title of the log. Default is `COMMAND`
     * @param m The message of the log
     * @returns {void}
     */
    command(t = "COMMAND", m: string): void {
        console.log(`[ ${chalk.hex("#DAEE94")(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex("#DAEE94")(m)}`);
    }

    /**
     * Logs an error logging message
     * @param t The title of the log. Default is `ERROR`
     * @param m The message of the log
     * @returns {void}
     */
    error(t = "ERROR", m: string): void {
        console.log(`[ ${chalk.redBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.redBright(m)}`);
    }

    /**
     * Logs an info logging message
     * @param t The title of the log. Default is `INFO`
     * @param m The message of the log
     * @returns {void}
     */
    info(t = "INFO", m: string): void {
        console.log(`[ ${chalk.cyanBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.cyanBright(m)}`);
    }

    /**
     * Logs a custom logging message
     * @param t The title of the log
     * @param m The message of the log
     * @param c The custom hex code
     * @returns {void}
     */
    log(t: string, m: string, c: string): void {
        console.log(`[ ${chalk.hex(c)(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex(c)(m)}`);
    }

    /**
     * Logs a success logging message
     * @param t The title of the log. Default is `SUCCESS`
     * @param m The message of the log
     * @returns {void}
     */
    success(t = "SUCCESS", m: string): void {
        console.log(`[ ${chalk.greenBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.greenBright(m)}`);
    }

    /**
     * Logs a system logging message
     * @param t The title of the log. Default is `SYSTEM`
     * @param m The message of the log
     * @returns {void}
     */
    system(t = "SYSTEM", m: string): void {
        console.log(`[ ${chalk.blue(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.blue(m)}`);
    }

    /**
     * Logs a warning logging message
     * @param t The title of the log. Default is `WARNING`
     * @param m The message of the log
     * @returns {void}
     */
    warn(t = "WARNING", m: string): void {
        console.log(`[ ${chalk.yellow(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.yellow(m)}`);
    }
}