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
const noop = () => {};
export interface ILoggerConf {
    /**
     * The returned value of this function will be printed as prefix
     */
    prefix?: () => string;
    /**
     * The returned value of this function will be printed as suffix
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
}

export class Logger {
    private _minLevel: number = LogLevel[LevelStrings.NONE];
    private _maxLevel: number = LogLevel[LevelStrings.DEBUG];

    private _level: number;
    private _levelString: LevelString_t;
    private _conf: ILoggerConf;

    constructor(levelName: LevelString_t, conf?: ILoggerConf) {
        this._conf = this._buildConf(conf);
        if (typeof levelName !== "string" || !(levelName in LevelStrings)) {
            this.setLevel(LevelStrings.INFO);
        } else {
            this.setLevel(LevelStrings[levelName]);
        }
    }

    private _buildConf: (conf: ILoggerConf) => ILoggerConf = (conf?: ILoggerConf) => {
        return {
            prefix: conf?.prefix,
            suffix: conf?.suffix,
            leftSeparator: isNil(conf?.leftSeparator) ? "" : conf?.leftSeparator,
            rightSeparator: isNil(conf?.rightSeparator) ? "" : conf?.rightSeparator
        };
    };

    private _messageParts = (_console: string, lev: LevelString_t) => {
        const prefix = isNil(this._conf.prefix) ? "" : this._conf.prefix();
        const suffix = isNil(this._conf.suffix) ? "" : this._conf.suffix();
        const leftSeparator = prefix ? this._conf.leftSeparator : "";
        const rightSeparator = suffix ? this._conf.rightSeparator : "";
        const left = `${prefix} ${leftSeparator}`.trim();
        const right = `${rightSeparator} ${suffix}`.trim();
        const tag = `[${lev.toUpperCase()}]`;
        return { prefix, suffix, leftSeparator, rightSeparator, left, right, tag };
    };

    public setLevel = (levelString: LevelString_t) => {
        const level = LogLevel[levelString];
        const shouldSet = level >= this._minLevel && level <= this._maxLevel;
        this._level = shouldSet ? level : LogLevel.info;
        this._levelString = levelString;
    };

    public getLevel = () => this._levelString;

    public disableLogging = () => {
        this.setLevel(LevelStrings.NONE);
    };

    private _wrapLog = (_console: string, levelString: LevelString_t) => (...args: any[]) => {
        if (!args.length) return;
        const level = LogLevel[levelString];
        if (this._level && level <= this._level) {
            const { left, right, tag } = this._messageParts(_console, levelString);
            // prevent left padding when prefix is missing
            console[_console]([left, tag, ...args, right].join(" ").trim());
        }
    };

    public setLevelError = () => this.setLevel(LevelStrings.INFO);
    public setLevelWarning = () => this.setLevel(LevelStrings.WARNING);
    public setLevelInfo = () => this.setLevel(LevelStrings.INFO);
    public setLevelVerbose = () => this.setLevel(LevelStrings.VERBOSE);
    public setLevelDebug = () => this.setLevel(LevelStrings.DEBUG);

    public error = this._wrapLog("error", LevelStrings.ERROR);
    public warning = this._wrapLog("warn", LevelStrings.WARNING);
    public info = this._wrapLog("info", LevelStrings.INFO);
    public verbose = this._wrapLog("info", LevelStrings.VERBOSE);
    public debug = this._wrapLog("debug", LevelStrings.DEBUG);
}
