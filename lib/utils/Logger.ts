import chalk from "chalk";
import moment from "moment";

interface LoggingOptions {
    type?: string;
    title: string;
    subTitle?: string;
    message: string;
}

interface CustomLoggingOptions {
    type: string;
    title: string;
    subTitle?: string;
    message: string;
    color: string;
}

/**
 * Represents a Logger class to facilitate the logging implementation
 */
export class Logger {
    /**
     * Logs an error logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    error(options: LoggingOptions): void {
        return console.log(`${chalk.bgRed(` ${options.type ? options.type.toUpperCase() : "ERROR"} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.red(options.message)}`);
    }

    /**
     * Logs an info logging message
     * @param options The logging options
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    info(options: LoggingOptions): void {
        return console.log(`${chalk.bgCyan(` ${options.type ? options.type.toUpperCase() : "INFO"} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.cyan(options.message)}`);
    }

    /**
     * Logs a custom logging message
     * @param options The logging options
     * @param options.color The color of the log
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    log(options: CustomLoggingOptions): void {
        return console.log(`${chalk.bgHex(options.color)(` ${options.type.toUpperCase()} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.hex(options.color)(options.message)}`);
    }

    /**
     * Logs a success logging message
     * @param options The logging options
     * @param options.color The color of the log
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    success(options: LoggingOptions): void {
        return console.log(`${chalk.bgGreen(` ${options.type ? options.type.toUpperCase() : "SUCCESS"} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.green(options.message)}`);
    }

    /**
     * Logs a system logging message
     * @param options The logging options
     * @param options.color The color of the log
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    system(options: LoggingOptions): void {
        return console.log(`${chalk.bgBlue(` ${options.type ? options.type.toUpperCase() : "SYSTEM"} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.blue(options.message)}`);
    }

    /**
     * Logs a warning logging message
     * @param options The logging options
     * @param options.color The color of the log
     * @param options.message The message of the log
     * @param options.type The type of the log
     * @param options.title The title of the log
     * @param options.subTitle The sub title of the log. This comes after the title
     * @returns {void}
     */
    warn(options: LoggingOptions): void {
        return console.log(`${chalk.bgYellow(` ${options.type ? options.type.toUpperCase() : "WARNING"} `)}${options.subTitle ? chalk.bgWhite(chalk.black(` ${options.subTitle} `)) : ""} ${chalk.underline(options.title.toUpperCase())} - ${chalk.grey(moment().format("MMMM Do YYYY, hh:mm:ss A"))} - ${chalk.yellow(options.message)}`);
    }
}
