
import express = require('express');
import cors = require('cors');
import https = require('https');
import { Application, Request, Response } from 'express';
import bodyParser = require('body-parser');
import { APIResponseHandler } from './lib/api-response-handler';
import { sendResponse } from './lib/helperFunctions';
import { LoggingService, ErrorSeverity } from './lib/logging-service';
import { ConfigurationManager } from './config/config';
import { HttpsAgentFactory } from './lib/httpsAgentFactory';
import fs = require('fs');

export interface AppRouteController {
    addRoutes: (app: Application) => void;
}

initializeApp();

// -------------------------------------------------------------------------------------------------------------------------------

// Initializes the Express app
function initializeApp() {
    const app: Application = express();

    try {
        addApplicationMiddleware(app);
        startApp(app);
    } catch (e) {
        LoggingService.Logger.logError(e, ErrorSeverity.Crash);
        exit();
    }
}

// -------------------------------------------------------------------------------------------------------------------------------

// Add various middleware to the application for handling standard
// processing on all inbound requests
function addApplicationMiddleware(
    app: Application
): void {
    // Allow Cross-Origin Scripting on all routes
    app.use(cors());

    // Route all incoming requests through the JSON parser where Content-Type = "application/json"
    app.use(bodyParser.json());

    // Add encoding middleware for:
    // 
    // - Deflation of compressed request body content
    // - Parsing of URL encoding
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Add GZIP compression to outgoing responses
    var compression = require('compression')
    app.use(compression({
        threshold: ConfigurationManager.config.COMPRESSION_THRESHOLD
    }));

    // Add an APIResponseHandler instance to all request objects so that route controllers
    // can make use of them without needing to explicitly instantiate them for each route
    app.use('/api', addResponseHandler)
}

// ------------------------------------------------------------------------------------------------------------------------------

export interface ResponseWithHandler extends Response {
    handler: APIResponseHandler;
}

export interface RequestWithAuthInfo extends Request {
    userGuid: string;
    userInfo: { fullName: string, userId: string }
}

function addResponseHandler(req, res, next) {
    res.handler = new APIResponseHandler(res)
    next();
}

// ------------------------------------------------------------------------------------------------------------------------------

function startApp(app: Application) {

    // Listen on the configured port
    var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    
    var credentials = {key: privateKey, cert: certificate};
    var server = https.createServer(credentials, app);

    const port = ConfigurationManager.config.APP_PORT || 3000;
    
    server.listen(port);
    LoggingService.Logger.logMessage("I'm listening...");

    var env = process.env.NODE_ENV || "DEBUG";

    setTimeout(() => {
        if (env === "DEBUG") {
            LoggingService.Logger.logMessage(`
                ******************************************************************************************
                WARNING! YOU ARE RUNNING IN DEBUG MODE AND UNAUTHORIZED TLS CONNECTIONS ARE ALLOWED! 
                IF YOU ARE IN PRODUCTION PLEASE ENSURE THAT NODE_ENV IS SET TO SOMETHING ELSE AS SOON AS POSSIBLE
                ******************************************************************************************`);
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
    }, 3000);

    // Cleanup if Node process ends
    process.on('SIGINT', function () {
        // Clean up HTTPS agents used for reaching out to other micro-services
        HttpsAgentFactory.destroyAllAgents();

        server.close();  // Release the socket on the configured app port, otherwise the host process will continue to hold it open
        LoggingService.Logger.logMessage("All cleaned up!");
    });
}
    
// ------------------------------------------------------------------------------------------------------------------------------

function exit() {
    process.exit();
}
