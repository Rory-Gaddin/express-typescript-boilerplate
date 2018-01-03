import { LoggerTypes } from '../lib/logging-service';
import fs = require('fs');

export interface Configuration {
    APP_PORT: number;
    COMPRESSION_THRESHOLD: number;
    LOGGER_TYPE: LoggerTypes.ConsoleLogger;
    FULL_STACK_TRACE_ON_ERROR: boolean;
}

export class ConfigurationManager {
    private static _config: Configuration;

    static get config(): Configuration {
        if (this._config === undefined) {
            this.loadConfig();
        }

        return this._config;
    }

    private static loadConfig(): void {
        // Do this synchronously as it is only called once at initialization, so we can tolerate a blocking call
        const data = fs.readFileSync(__dirname + '/config.json', 'utf8');
        const configValues = JSON.parse(data);

        this._config = {
            APP_PORT: configValues['appPort'],
            COMPRESSION_THRESHOLD: configValues['compressionThreshold'],
            LOGGER_TYPE: configValues['loggerType'],
            FULL_STACK_TRACE_ON_ERROR: configValues['fullStackTraceOnError']
        };
    }
};