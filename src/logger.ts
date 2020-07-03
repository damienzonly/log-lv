enum LevelStrings_enum {
    NONE = "none",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    VERBOSE = "verbose",
    DEBUG = "debug"
}

/**
 * used only for validating the string provided by the user
 */
const _levelsNames = "none error warning info verbose debug".split(" ");

export type LevelString_t = "none" | "error" | "warning" | "info" | "verbose" | "debug";

export const LogLevel = {
    [LevelStrings_enum.NONE]: 0,
    [LevelStrings_enum.ERROR]: 1,
    [LevelStrings_enum.WARNING]: 2,
    [LevelStrings_enum.INFO]: 3,
    [LevelStrings_enum.VERBOSE]: 4,
    [LevelStrings_enum.DEBUG]: 5
};
const isUndefined = v => v === undefined;
const isNull = v => v === null;
const isNil = v => isUndefined(v) || isNull(v);

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
    protected _minLevel: number = LogLevel[LevelStrings_enum.NONE];
    protected _maxLevel: number = LogLevel[LevelStrings_enum.DEBUG];

    protected _level: number;
    protected _levelString: LevelString_t;
    protected _conf: ILoggerConf;

    constructor(levelName: LevelString_t, conf?: ILoggerConf) {
        this._conf = this._buildConf(conf);
        if (typeof levelName !== "string" || _levelsNames.indexOf(levelName.toLowerCase()) === -1) {
            this.setLevel(LevelStrings_enum.INFO);
        } else {
            this.setLevel(LevelStrings_enum[levelName.toUpperCase()]);
        }
    }

    public setLevel(levelString: LevelString_t) {
        const level = LogLevel[levelString];
        const shouldSet = level >= this._minLevel && level <= this._maxLevel;
        this._level = shouldSet ? level : LogLevel.info;
        this._levelString = levelString;
    }

    public getLevel() {
        return this._levelString;
    }

    public disableLogging() {
        this.setLevel(LevelStrings_enum.NONE);
    }

    public setLevelError() {
        this.setLevel(LevelStrings_enum.INFO);
    }

    public setLevelWarning() {
        this.setLevel(LevelStrings_enum.WARNING);
    }

    public setLevelInfo() {
        this.setLevel(LevelStrings_enum.INFO);
    }

    public setLevelVerbose() {
        this.setLevel(LevelStrings_enum.VERBOSE);
    }

    public setLevelDebug() {
        this.setLevel(LevelStrings_enum.DEBUG);
    }

    public error(...args) {
        this._wrapLog("error", LevelStrings_enum.ERROR)(...args);
    }

    public warning(...args) {
        this._wrapLog("warn", LevelStrings_enum.WARNING)(...args);
    }

    public info(...args) {
        this._wrapLog("info", LevelStrings_enum.INFO)(...args);
    }

    public verbose(...args) {
        this._wrapLog("info", LevelStrings_enum.VERBOSE)(...args);
    }

    public debug(...args) {
        this._wrapLog("debug", LevelStrings_enum.DEBUG)(...args);
    }

    protected _buildConf(conf: ILoggerConf): ILoggerConf {
        return {
            prefix: conf?.prefix,
            suffix: conf?.suffix,
            leftSeparator: isNil(conf?.leftSeparator) ? "" : conf?.leftSeparator,
            rightSeparator: isNil(conf?.rightSeparator) ? "" : conf?.rightSeparator
        };
    }

    protected _messageParts(_console: string, lev: LevelString_t) {
        const prefix = isNil(this._conf.prefix) ? "" : this._conf.prefix();
        const suffix = isNil(this._conf.suffix) ? "" : this._conf.suffix();
        const leftSeparator = prefix ? this._conf.leftSeparator : "";
        const rightSeparator = suffix ? this._conf.rightSeparator : "";
        const left = `${prefix} ${leftSeparator}`.trim();
        const right = `${rightSeparator} ${suffix}`.trim();
        const tag = `[${lev.toUpperCase()}]`;
        return { prefix, suffix, leftSeparator, rightSeparator, left, right, tag };
    }

    protected _wrapLog = (_console: string, levelString: LevelString_t) => (...args: any[]) => {
        if (!args.length) return;
        const level = LogLevel[levelString];
        if (!this._level || level > this._level) return;
        const { left, right, tag } = this._messageParts(_console, levelString);
        const parts = [left.trim(), tag.trim(), ...args, right.trim()];
        // prevent left padding when prefix is missing
        if (!left) parts.shift();
        console[_console](...parts);
    };
}
