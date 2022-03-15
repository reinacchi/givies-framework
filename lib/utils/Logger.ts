import chalk from "chalk";
import moment from "moment";

interface LoggingOptions {
    title?: string;
    message: string;
}

interface CustomLoggingOptions {
    title: string;
    message: string;
    color: string;
}

/**
 * Represents a Logger class to facilitate the logging implementation
 */
export class Logger {
    /**
     * Logs a command logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `COMMAND`
     * @returns {void}
     */
    command(options: LoggingOptions): void {
        return console.log(`[ ${chalk.hex("#DAEE94")(options.title ?? "COMMAND")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex("#DAEE94")(options.message)}`);
    }

    /**
     * Logs an error logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `ERROR`
     * @returns {void}
     */
    error(options: LoggingOptions): void {
        return console.log(`[ ${chalk.redBright(options.title ?? "ERROR")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.redBright(options.message)}`);
    }

    /**
     * Logs an info logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `INFO`
     * @returns {void}
     */
    info(options: LoggingOptions): void {
        return console.log(`[ ${chalk.cyanBright(options.title ?? "INFO")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.cyanBright(options.message)}`);
    }

    /**
     * Logs a custom logging message
     * @param options The logging options
     * @param options.color The custom color of the log
     * @param options.message The message of the log
     * @param options.title The title of the log
     * @returns {void}
     */
    log(options: CustomLoggingOptions): void {
        return console.log(`[ ${chalk.hex(options.color)(options.title)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex(options.color)(options.message)}`);
    }

    /**
     * Logs a success logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `SUCCESS`
     * @returns {void}
     */
    success(options: LoggingOptions): void {
        return console.log(`[ ${chalk.greenBright(options.title ?? "SUCCESS")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.greenBright(options.message)}`);
    }

    /**
     * Logs a system logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `SYSTEM`
     * @returns {void}
     */
    system(options: LoggingOptions): void {
        return console.log(`[ ${chalk.blue(options.title ?? "SYSTEM")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.blue(options.message)}`);
    }

    /**
     * Logs a warning logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.title The title of the log. Default is `WARNING`
     * @returns {void}
     */    
    warn(options: LoggingOptions): void {
        return console.log(`[ ${chalk.yellow(options.title ?? "WARNING")} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.yellow(options.message)}`);
    }
}