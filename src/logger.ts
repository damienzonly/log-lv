enum LevelStrings {
    NONE = "none",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    VERBOSE = "verbose",
    DEBUG = "debug"
}
export type LevelString_t = "none" | "error" | "warning" | "info" | "verbose" | "debug";
export type LogLevel_t = {
    [key in LevelString_t]: number;
};

export const LogLevel = {
    [LevelStrings.NONE]: 0,
    [LevelStrings.ERROR]: 1,
    [LevelStrings.WARNING]: 2,
    [LevelStrings.INFO]: 3,
    [LevelStrings.VERBOSE]: 4,
    [LevelStrings.DEBUG]: 5
};
const isUndefined = v => v === undefined;
const isNull = v => v === null;
const isNil = v => isUndefined(v) || isNull(v);

export interface ILoggerConf {
    /**
     * The returned value of this function will be printed as prefix
     */
    prefix?: () => string | null;
    /**
     * The returned value of this function will be printed as suffix
     */
    suffix?: () => string | null;
    /**
     * Separator string between the prefix and the message. If prefix is not provided this value will be ignored
     */
    leftSeparator?: string | null;
    /**
     * Separator string between the message and the suffix. If suffix is not provided this value will be ignored
     */
    rightSeparator?: string | null;
}

export class Logger {
    private minLevel: number = LogLevel.none;
    private maxLevel: number = LogLevel.debug;

    private level: number;
    private conf: ILoggerConf;

    constructor(levelName: LevelString_t, conf?: ILoggerConf) {
        this.conf = this.buildConf(conf);
        if (typeof levelName !== "string" || !(levelName in LevelStrings)) {
            this.setLevel(LevelStrings.INFO);
        } else {
            this.setLevel(LevelStrings[levelName]);
        }
    }

    private buildConf: (conf: ILoggerConf) => ILoggerConf = (conf?: ILoggerConf) => {
        return {
            prefix: conf?.prefix,
            suffix: conf?.suffix,
            leftSeparator: isNil(conf?.leftSeparator) ? "" : conf?.leftSeparator,
            rightSeparator: isNil(conf?.rightSeparator) ? "" : conf?.rightSeparator
        };
    };

    private log = (lev: string, ...args: any[]) => {
        const prefix = this.conf.prefix ? this.conf.prefix() : "";
        const suffix = this.conf.suffix ? this.conf.suffix() : "";
        const leftSeparator = prefix ? this.conf.leftSeparator : "";
        const rightSeparator = suffix ? this.conf.rightSeparator : "";
        const left = `${prefix} ${leftSeparator}`.trim();
        const right = `${rightSeparator} ${suffix}`.trim();
        const tag = `[${lev.toUpperCase()}]`;
        // prevent left padding when prefix is missing
        console.log([left, tag, ...args, right].join(" ").trim());
    };

    public setLevel = (levelString: LevelString_t) => {
        const level = LogLevel[levelString];
        const shouldSet = level >= this.minLevel && level <= this.maxLevel;
        this.level = shouldSet ? level : LogLevel.info;
    };

    public getLevel = () => this.level;

    public disableLogging = () => {
        this.setLevel(LevelStrings.NONE);
    };

    private genLog = (levelString: LevelString_t) => (...args: any[]) => {
        const level = LogLevel[levelString];
        if (this.level && level <= this.level) {
            this.log(levelString, ...args);
        }
    };

    public setLevelNone = () => this.setLevel(LevelStrings.NONE);
    public setLevelError = () => this.setLevel(LevelStrings.INFO);
    public setLevelWarning = () => this.setLevel(LevelStrings.WARNING);
    public setLevelInfo = () => this.setLevel(LevelStrings.INFO);
    public setLevelVerbose = () => this.setLevel(LevelStrings.VERBOSE);
    public setLevelDebug = () => this.setLevel(LevelStrings.DEBUG);

    public error = this.genLog(LevelStrings.ERROR);
    public warning = this.genLog(LevelStrings.WARNING);
    public info = this.genLog(LevelStrings.INFO);
    public verbose = this.genLog(LevelStrings.VERBOSE);
    public debug = this.genLog(LevelStrings.DEBUG);
}
