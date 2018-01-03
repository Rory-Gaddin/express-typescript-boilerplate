export function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  }

/*  Helper function that sends a Response with the requested headers and data if it 
    has not been sent already.
    
    This is done to handle situations where multiple listeners running in parallel might
    attempt to send the Response, causing the application to crash.

    If a response has already been sent, then a message to this effect will be sent back,
    along with an Array of responses which have already been sent to assist in troubleshooting.
*/
export function sendResponse(res, data, headers) {
    if (!res.finished) {
        if (!headers) { headers = {} };

        // Ensure that the Content-Length header is always set
        if (!Object.keys(headers).filter(key => key.toLowerCase() === 'content-length')) {
            headers['Content-Length'] = lengthInUtf8Bytes(data);
        }

        Object.keys(headers).forEach(key => {
            res.setHeader(key, headers[key]);
        })

        // Add this response to the list of responses that we are attempting to send
        try {
            res.send(data)
        } catch(err) {
            return {
                success: false,
                message: "There was an error with attempting to send the last response.  " + 
                    err.message
            }
        };

        return {
            success: true,
            message: "The response was successfully sent"
        };
    }

    return {
        success: false,
        message: "This response was already sent.  See the responses already sent for details."
    }
};

/*  Accepts the initial response from an HTTPS GET and accumulates all chunks
    before invoking the callback function and passing it the full response as a String
*/
export function accumulateChunkedResponse(initialResponse, callback) {
    var fullResponse = "";
    initialResponse.on('data', (data) => {
        fullResponse += data;
    });

    // Once all the data has been received, send it to
    // the requested callback function
    initialResponse.on('end', () => {
        callback(fullResponse);
    });

    // Catch any errors that might be thrown by the response
    initialResponse.on('error', (err) => {
        callback(err);
    });
}
