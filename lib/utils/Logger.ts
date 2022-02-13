import chalk from "chalk";
import moment from "moment";

export class Logger {

    log(t: string, m: string, c: string) {
        console.log(`[ ${chalk.hex(c)(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex(c)(m)}`);
    }

    error(t: string, m: string) {
        console.log(`[ ${chalk.redBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.redBright(m)}`);
    }

    success(t: string, m: string) {
        console.log(`[ ${chalk.greenBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.greenBright(m)}`);
    }

    info(t: string, m: string) {
        console.log(`[ ${chalk.cyanBright(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.cyanBright(m)}`);
    }

    warn(t: string, m: string) {
        console.log(`[ ${chalk.yellow(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.yellow(m)}`);
    }

    command(t: string, m: string) {
        console.log(`[ ${chalk.hex("#DAEE94")(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.hex("#DAEE94")(m)}`);
    }

    system(t: string, m: string) {
        console.log(`[ ${chalk.blue(t)} ] - ${chalk.grey(moment().format("MMMM Do YYYY, h:mm:ss a"))} - ${chalk.blue(m)}`);
    }
}