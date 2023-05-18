export enum LevelStrings {
    NONE = "none",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    VERBOSE = "verbose",
    DEBUG = "debug"
}

/**
 * used for validating the string provided by the user
 */
const _levelsNames = "none error warning info verbose debug".split(" ");

// legacy export
export type LevelString_t = "none" | "error" | "warning" | "info" | "verbose" | "debug";
export type LevelString = "none" | "error" | "warning" | "info" | "verbose" | "debug";

export const LogLevel = {
    [LevelStrings.NONE]: 0,
    [LevelStrings.ERROR]: 1,
    [LevelStrings.WARNING]: 2,
    [LevelStrings.INFO]: 3,
    [LevelStrings.VERBOSE]: 4,
    [LevelStrings.DEBUG]: 5
};

const isNil = v => v === undefined || v === null;
const noop = () => "";

export interface ILoggerConf {
    /**
     * The returned value of this function will be printed as prefix at each call
     */
    prefix?: () => string;
    /**
     * The returned value of this function will be printed as suffix at each call
     */
    suffix?: () => string;
    /**
     * Separator string between the prefix and the message. If prefix is not provided this value will be ignored
     */
    leftSeparator?: string;
    /**
     * Separator string between the message and the suffix. If suffix is not provided this value will be ignored
     */
    rightSeparator?: string;
    /**
     * executing before logging to console
     */
    beforeLogging?: (parts?: string[]) => void;
    /**
     * executing before logging to console
     */
    afterLogging?: (parts?: string[]) => void;
}

export class Logger {
    protected minLevel: number = LogLevel[LevelStrings.NONE];
    protected maxLevel: number = LogLevel[LevelStrings.DEBUG];

    protected currentLevel: number;
    protected currentLevelName: LevelString;
    protected conf: ILoggerConf;

    constructor(levelName: LevelString, conf?: ILoggerConf) {
        this.conf = this.applyConf(conf);
        const shouldBeInfo = typeof levelName !== "string" || _levelsNames.indexOf(levelName.toLowerCase()) === -1;
        this.setLevel(shouldBeInfo ? LevelStrings.INFO : LevelStrings[levelName.toUpperCase()]);
    }

    public setLevel(levelString: LevelString) {
        const level = LogLevel[levelString];
        const shouldSet = level >= this.minLevel && level <= this.maxLevel;
        this.currentLevel = shouldSet ? level : LogLevel.info;
        this.currentLevelName = levelString;
    }

    public getLevelName() {
        return this.currentLevelName;
    }

    public getLevel() {
        return this.currentLevel;
    }

    public disableLogging() {
        this.setLevel(LevelStrings.NONE);
        return this;
    }

    public setLevelError() {
        this.setLevel(LevelStrings.INFO);
        return this;
    }

    public setLevelWarning() {
        this.setLevel(LevelStrings.WARNING);
        return this;
    }

    public setLevelInfo() {
        this.setLevel(LevelStrings.INFO);
        return this;
    }

    public setLevelVerbose() {
        this.setLevel(LevelStrings.VERBOSE);
        return this;
    }

    public setLevelDebug() {
        this.setLevel(LevelStrings.DEBUG);
        return this;
    }

    public error(...args: Parameters<typeof console.error>) {
        this.logWrapper("error", LevelStrings.ERROR)(...args);
    }

    public warning(...args: Parameters<typeof console.warn>) {
        this.logWrapper("warn", LevelStrings.WARNING)(...args);
    }

    public info(...args: Parameters<typeof console.info>) {
        this.logWrapper("info", LevelStrings.INFO)(...args);
    }

    public verbose(...args: Parameters<typeof console.info>) {
        this.logWrapper("info", LevelStrings.VERBOSE)(...args);
    }

    public debug(...args: Parameters<typeof console.debug>) {
        this.logWrapper("debug", LevelStrings.DEBUG)(...args);
    }

    protected applyConf(conf: ILoggerConf): ILoggerConf {
        return {
            prefix: conf?.prefix || noop,
            suffix: conf?.suffix || noop,
            leftSeparator: isNil(conf?.leftSeparator) ? "" : conf?.leftSeparator,
            rightSeparator: isNil(conf?.rightSeparator) ? "" : conf?.rightSeparator
        };
    }

    protected pad(s: string, char = " ") {
        return char + s + char;
    }

    protected getLineParts(lev: LevelString) {
        const prefix = this.conf.prefix();
        const suffix = this.conf.suffix();
        const leftSeparator = prefix ? this.pad(this.conf.leftSeparator) : "";
        const rightSeparator = suffix ? this.pad(this.conf.rightSeparator) : "";
        const left = `${prefix}${leftSeparator}`.trim();
        const right = `${rightSeparator}${suffix}`.trim();
        const tag = `[${lev.toUpperCase()}]`;
        return { prefix, suffix, leftSeparator, rightSeparator, left, right, tag };
    }

    protected logWrapper: (
        consoleFn: string,
        levelString: LevelString
    ) => (...data: Parameters<typeof console.log>) => ReturnType<typeof console.log> = (consoleFn, levelString) => (
        ...args
    ) => {
        if (!args.length) return;
        const level = LogLevel[levelString];
        if (!this.currentLevel || level > this.currentLevel) return;
        const { left, right, tag } = this.getLineParts(levelString);
        const rest = [tag, ...args, right];
        const parts = left ? [left, ...rest] : rest;
        this.conf.beforeLogging?.(parts);
        console[consoleFn](...parts);
        this.conf.afterLogging?.(parts);
    };
}
