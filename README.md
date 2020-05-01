# Log LV

Log level for both client and server written in pure TypeScript

# Usage
```typescript
import { Logger } from "log-lv";
const loggerInstance = new Logger("debug", {
    prefix: () => new Date().toISOString(),
    suffix: () => "SUFFIX",
    leftSeparator: ">>>",
    rightSeparator: "<<<"
});
loggerInstance.debug("MY", "MESSAGE");

// Output:
// 2020-04-30T22:50:08.683Z >>> [DEBUG] MY MESSAGE <<< SUFFIX
```

## Logger configuration
The first parameter is the initial log level. It can be changed also at runtime with the `setLevel` method.


|Type|Options|Default Value|
|-|-|-|
|string | `none`, `error`, `warning`, `info`, `verbose`, `debug` | `info`

The second (optional) parameter to be passed to the Logger constructor has the following properties

|Property|Type|Description|Default Value|
|-|-|-|-|
|prefix|`() => string`|The returned value of this function will be printed as prefix|""|
|suffix|`() => string`|The returned value of this function will be printed as suffix|""|
|leftSeparator|`string`|Separator string between the prefix and the message. If prefix is not provided this value will be ignored| "" |
|leftSeparator|`string`|Separator string between the message and the suffix. If suffix is not provided this value will be ignored| "" |

# API
|Method| Type Definition | Description
|-|-|-|
|setLevel | `(level: string) => void` | Change log level|
|getLevel | `() => number` | Get current log level|
|error | `(...args: any[]) => void` | Display error message|
|warning | `(...args: any[]) => void` | Display warning message|
|info | `(...args: any[]) => void` | Display info message|
|verbose | `(...args: any[]) => void` | Display verbose message|
|debug | `(...args: any[]) => void` | Display debug message|
|disableLogging | `() => void` | Disables logging
|setLevelError| `() => void` | Set log level to Error
|setLevelWarning| `() => void` | Set log level to Warning
|setLevelInfo| `() => void` | Set log level to Info
|setLevelVerbose| `() => void` | Set log level to Verbose
|setLevelDebug| `() => void` | Set log level to Debug