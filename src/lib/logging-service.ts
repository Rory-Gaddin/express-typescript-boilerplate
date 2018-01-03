import { ConfigurationManager } from '../config/config';
export enum ErrorSeverity {
    Warning = "Warning",
    Error = "Error",
    Crash = "Fatal"
}

// List of supported logger types (can be extended with new ones in future, for example
// for logging to Rollbar or something similar)
export enum LoggerTypes {
    ConsoleLogger = "console"
}

export interface Logger {
    logMessage(message: String): void;
    logError(error: Error, severity: ErrorSeverity): void;
}

export class ConsoleLogger implements Logger {
    logMessage(message: String): void {
        console.log(message);
    }
    
    logError(error: Error, severity: ErrorSeverity): void {
        console.log(severity.toUpperCase() + ': ' + error.message);
        
        if (ConfigurationManager.config.FULL_STACK_TRACE_ON_ERROR) {
            console.log(error.stack);
        }
    }
}

export class LoggingService {
    private static _logger: Logger;

    static get Logger(): Logger {
        if (this._logger === undefined) {
            const loggerType = ConfigurationManager.config.LOGGER_TYPE;

            switch (loggerType) {
                case LoggerTypes.ConsoleLogger:
                    this._logger = new ConsoleLogger();
                    break;
                default:
                    throw(`Invalid logger type ${loggerType}!`);
            }
        }

        return this._logger;
    }
}