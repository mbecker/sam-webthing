const https = require('https');

const WEBTHING_SERVER = 'https://ginsheim.mozilla-iot.org';

const alexaEndpoint = {
    manufacturerName: 'Webthing'
};

exports.alexaHandler = function(request, context) {
    log("DEBUG", "Request", JSON.stringify(request));
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        log("DEBUG", "Discover request");
        handleDiscovery(request, context);
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            log("DEBUG", "TurnOn or TurnOff Request");
            handlePowerControl(request, context);
        }
    }
    else if (request.directive.header.namespace === 'Alexa') {
        if (request.directive.header.name === 'ReportState') {
            /* Sample request
            {
                "directive": {
                    "header": {
                        "namespace": "Alexa",
                        "name": "ReportState",
                        "payloadVersion": "3",
                        "messageId": "a9d10985-f68a-42bb-973c-421af8079092",
                        "correlationToken": "AAAAAAAAAQDUJ9Lb70vu09eyVL/vXQAX/AEAAAAAAAANwzKBhlfOmSZCazWWCJX2j/FUygQ67qMwZNCy1A1CUovqhSzvto0jQbcGNeFlScCjxdXscD8mVsf7pH2wEqAmrI9Ci8yCTvqZK0wzXoir+vaXQHhCtTqL8PZEBBNS8+GZx0n4pKGghvxwkwUiRAhKj5AMM4lsxyGYZfDl0SSnDlDqDfsOTnW7ZyEZ78Dz3m+Sc5S0AI9Wss59zte0yesd/QnQbkp+a74+hEoDgehUyAJ226FZ8QrQ2o7TZVjkX4RmrX6+PXdmpj0Ui37GPvyNtB3OHaal7JrXNZYwxujPQpptCcFW8OvusLJUS0gxh+zarCrsYnNGmJxaB/hhssfuEubwiBaMWgKNBXxA06tcm8yN9FgXscKPtMQ8ijpuajcOB9wVDHmT8WulTEMJDd6tOxJ/n+RBfQQ3yKC5n8r4CyyTs+Wb77p6QFP9kDhhJEYeNzu3JV7yoqxDIXqr+GxnW5ldF7a/y6r6muYx7Yxy2Ldx2FD7lJCjWnodTGRUW6Zzi+lGpCccPCyw0qNj2F9XO+/fMl2fbiwVwP5OXIjFixK10AQxxNeSNKuuVJKH0C0ZjtL999HXBdy2WxO7kp6hvF5FsR9JjmTec+m3FVDynwI0wNVWSn2dayqaRhYWpUCAs7IYQxBQJGgGUq4kKoWN2SGiazGEfQRKYLs9"
                    },
                    "endpoint": {
                        "scope": {
                            "type": "BearerToken",
                            "token": "eyJraWQiOiJ0akE5LWt1TGFibjNKcHVfUDZFZ3RrTzN6dXh5b3J4R0RRY0pYNUVvbjhZIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlJDQmhJcmdNcEtzWno2bXBjYlJ4UUpSbkt0TkNNVUxwQVFFZVpBdm9DOGsiLCJpc3MiOiJodHRwczovL2Rldi02MTQ0NzUub2t0YS5jb20vb2F1dGgyL2F1c2Uxbm1mNlZEN0wxUURqNHg2IiwiYXVkIjoiaHR0cDovL2FsZXhhd2VidGhpbmcuY29tIiwiaWF0IjoxNTkxMjE0MzE4LCJleHAiOjE1OTEzMDA3MTgsImNpZCI6IjBvYWUxcDUxcjV1Q0F1TEZMNHg2IiwidWlkIjoiMDB1ZTFlZTZ5TVB5VW41dEc0eDYiLCJzY3AiOlsicHJvZmlsZSIsIm9wZW5pZCJdLCJzdWIiOiJtYXRzLmJlY2tlckBnbWFpbC5jb20iLCJGYXZvcml0ZUNvbG9yQ2xhaW0iOiJyZWQiLCJFbWFpbENsYWltIjoibWF0cy5iZWNrZXJAZ21haWwuY29tIn0.TeB-iM2E1qlBvvlh8BwusrzUhFuNl5pv0VufGEOmey9pbYUdBQ-OZRtOhyB1BPE1sINcKhmVzyrsjxWuIgZ8MSV9oH7JhJ0-6oX_zi9repn7gcaeBC2YbL5Q1bzfKetprhKvn9NbDz8z_368kcTdXRYO4ZFYBt4KoC8aY71nb2P8phzCm2YFppokeVpug1JnvyhyVLXB4FGDPoQzqwJxbrv3-bnY_aniipf1JdEcg4B0Kc5jmdALvSaBNOH-tG_fHAAENdC5ddroLFR7E2wcQhV7ujmbZJ_T4nm2Z_i3hRJLLxvI9ZGIOuBUj4DKDof-9UL7blLBEE86lKucDYJJig"
                        },
                        "endpointId": "11487F",
                        "cookie": {
                            "relay0": "Alexa.PowerController"
                        }
                    },
                    "payload": {}
                }
            }
            */
            if (!Object.prototype.hasOwnProperty.call(request['directive']['endpoint'], 'endpointId')) context.succeed({ error: 'No endpointId given' });
            if (!Object.prototype.hasOwnProperty.call(request['directive']['endpoint'], 'cookie')) context.succeed({ error: 'No cookie given' });
            const endpointId = request['directive']['endpoint']['endpointId'];
            const cookie = request['directive']['endpoint']['cookie'];
            // TODO: How to handle more than one propertyKey in the cookie?
            let propertKey;
            for (const key in cookie) {
                propertKey = key;
            }
            if (!propertKey) context.succeed({ error: 'No cookie-propertKey given' });

            const options = {
                'method': 'GET',
                'hostname': 'ginsheim.mozilla-iot.org',
                'path': `/things/${endpointId}/properties/${propertKey}`,
                'headers': {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + process.env.TOKEN
                },
                'maxRedirects': 20
            };


            https.get(options, (res) => {
                let dataString;
                res.on('data', chunk => {
                    dataString += chunk;
                });
                res.on("end", () => {
                    dataString = dataString.replace('undefined', '');

                    try {
                        const value = JSON.parse(dataString);
                        if (!Object.prototype.hasOwnProperty.call(value, propertKey)) throw new Error("No propertKey in response value from thing.property")
                        var header = request.directive.header;
                        // header.name = "Response";
                        header.name = "StateReport";
                        header.messageId = header.messageId + "-R";

                        const response = {
                            event: { header: header, payload: {}, endpoint: { endpointId: endpointId } },
                            context: {
                                "properties": [{
                                    "namespace": "Alexa.PowerController",
                                    "name": "powerState",
                                    "value": value[`${propertKey}`] ? 'ON' : 'OFF',
                                    "timeOfSample": new Date().toISOString(),
                                    "uncertaintyInMilliseconds": 50
                                }]
                            }
                        };
                        log("DEBUG", "ReportState Response");
                        context.succeed(response);
                    }
                    catch (error) {
                        context.succeed({ error: error });
                    }
                });
            }).on('error', (error) => {
                context.succeed({ error: error });
            })



        }
    }

    function handleDiscovery(request, context) {
        const options = {
            'method': 'GET',
            'hostname': 'ginsheim.mozilla-iot.org',
            'path': '/things',
            'headers': {
                'Accept': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdjZTk2YjUxLWFhZDMtNGU3Ny1iY2Q0LWE2MTI5OTU2NDEyZiJ9.eyJyb2xlIjoidXNlcl90b2tlbiIsImlhdCI6MTU5MTEwOTQ0MywiaXNzIjoiaHR0cHM6Ly9naW5zaGVpbS5tb3ppbGxhLWlvdC5vcmcifQ.Ghnj-bx7QOPB3qZnm5_yi8JYkTvIScTFP69FJiQVs8mvEQpYXhUfg99MPq0d2TnypKza_-jwh9i-59RoV80FNg'
            },
            'maxRedirects': 20
        };

        https.get(options, (res) => {
            let dataString;
            res.on('data', chunk => {
                dataString += chunk;
            });
            res.on("end", () => {
                dataString = dataString.replace('undefined', '');

                try {
                    const things = JSON.parse(dataString);

                    /**
                     * Alexa Response
                     * @type {AlexaResponse}
                     */
                    let payload = {
                        "endpoints": []
                    };


                    for (let index = 0; index < things.length; index++) {
                        const thing = things[index];
                        if (!Object.prototype.hasOwnProperty.call(thing, 'id')) continue;
                        const alexEndpointForDevice = getAlexaEndpoint(thing);
                        if ((alexEndpointForDevice instanceof Error) === false) {
                            payload.endpoints.push(alexEndpointForDevice);
                        }
                    }


                    // do something with JSON
                    var header = request.directive.header;
                    header.name = "Discover.Response";
                    log("DEBUG", "Discovery Response", JSON.stringify({ header: header, payload: payload }));
                    context.succeed({ event: { header: header, payload: payload } });
                }
                catch (error) {
                    context.succeed({ error: error });
                }
            });
        }).on('error', (error) => {
            context.succeed({ error: error });
        })

    }

    function log(message, message1, message2) {
        let msg = message;
        if(message1) msg = msg + ' - ' + message1;
        if(message2) msg = msg + ' - ' + message2;
        console.log(msg);
    }

    function handlePowerControl(request, context) {
        
        /**
         * Sample Request
          {
                "directive": {
                    "header": {
                        "namespace": "Alexa.PowerController",
                        "name": "TurnOn",
                        "payloadVersion": "3",
                        "messageId": "c207f8ae-3b49-4669-bded-fa10866f2e4f",
                        "correlationToken": "AAAAAAAAAQDUJ9Lb70vu09eyVL/vXQAX/AEAAAAAAAAnF7oGEoe9c6WGQ4Fj59QHYTyIcxUABOsSZIY/HRZ5sES6bKCGlVqESCEjB/KFA+AFcdUrJJAf/IQuXUnGHwUUIMzhtI9QMD3ldogDkYELZ9S6y76zqyp+u2D89lpHbVc1pFo6LQMFIeq7cVGKrM0jRhS7xLmgzw31Kc3N01JDpG4NMqQ679bPP5pwb9TUElI6bZY0zzcPE6yyspn9cg032Y3QuwI5mbO8mL3Jl/likCpw5KPGZ3NJgLjdoIa/3RJiOvaruyty63sBBH2nOFtjsx8i2l/cZfCA2qWd7TLS4ZeMMkE+1MbqTUb+y8EFeJcy5OOCymY9+WlT38tZ0ww1xsbxDzFglpCG/ZklmqOOuLyVsK+6xkOTT97PlvAmMLTkmkHrrJAAZTY6lRDKTAI2zcKMUPeDLmdxqTbIK+MEm/QEPwMgxIT2CSkiehPDgqm+bXynO+Ym7DLKIDIxK6BUkLEY8fF2PyqFIPtLG7tbwA/Dsab82g6VRTNJ0+w9l8+TdOfnOJo/h6pVjMaff/YyWziVmku22VsSzUgX4N3fYyTod05Au7ZbRdxEXC+yM8yZZwiHncAv6hFqOEuaunoHbUfQPr1Lu6YDb45Bnu/xY8Hia463Qhw/UC1JZjEJroXYdThUm3nDgb1PXL3/6mdQRFWPBmWYj3E01axS"
                    },
                    "endpoint": {
                        "scope": {
                            "type": "BearerToken",
                            "token": "eyJraWQiOiJ0akE5LWt1TGFibjNKcHVfUDZFZ3RrTzN6dXh5b3J4R0RRY0pYNUVvbjhZIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlJDQmhJcmdNcEtzWno2bXBjYlJ4UUpSbkt0TkNNVUxwQVFFZVpBdm9DOGsiLCJpc3MiOiJodHRwczovL2Rldi02MTQ0NzUub2t0YS5jb20vb2F1dGgyL2F1c2Uxbm1mNlZEN0wxUURqNHg2IiwiYXVkIjoiaHR0cDovL2FsZXhhd2VidGhpbmcuY29tIiwiaWF0IjoxNTkxMjE0MzE4LCJleHAiOjE1OTEzMDA3MTgsImNpZCI6IjBvYWUxcDUxcjV1Q0F1TEZMNHg2IiwidWlkIjoiMDB1ZTFlZTZ5TVB5VW41dEc0eDYiLCJzY3AiOlsicHJvZmlsZSIsIm9wZW5pZCJdLCJzdWIiOiJtYXRzLmJlY2tlckBnbWFpbC5jb20iLCJGYXZvcml0ZUNvbG9yQ2xhaW0iOiJyZWQiLCJFbWFpbENsYWltIjoibWF0cy5iZWNrZXJAZ21haWwuY29tIn0.TeB-iM2E1qlBvvlh8BwusrzUhFuNl5pv0VufGEOmey9pbYUdBQ-OZRtOhyB1BPE1sINcKhmVzyrsjxWuIgZ8MSV9oH7JhJ0-6oX_zi9repn7gcaeBC2YbL5Q1bzfKetprhKvn9NbDz8z_368kcTdXRYO4ZFYBt4KoC8aY71nb2P8phzCm2YFppokeVpug1JnvyhyVLXB4FGDPoQzqwJxbrv3-bnY_aniipf1JdEcg4B0Kc5jmdALvSaBNOH-tG_fHAAENdC5ddroLFR7E2wcQhV7ujmbZJ_T4nm2Z_i3hRJLLxvI9ZGIOuBUj4DKDof-9UL7blLBEE86lKucDYJJig"
                        },
                        "endpointId": "11487F",
                        "cookie": {
                            "relay0": "Alexa.PowerController"
                        }
                    },
                    "payload": {}
                }
            }
        */

        if (!Object.prototype.hasOwnProperty.call(request['directive']['endpoint'], 'endpointId')) context.succeed({ error: 'No endpointId given' });
        if (!Object.prototype.hasOwnProperty.call(request['directive']['endpoint'], 'cookie')) context.succeed({ error: 'No cookie given' });
        const endpointId = request['directive']['endpoint']['endpointId'];
        const cookie = request['directive']['endpoint']['cookie'];
        // TODO: How to handle more than one propertyKey in the cookie?
        let propertKey;
        for (const key in cookie) {
            propertKey = key;
        }
        if (!propertKey) context.succeed({ error: 'No cookie-propertKey given' });

        const requestMethod = request.directive.header.name; // 'TurnOn' or 'TurnOff'


        const options = {
            'method': 'PUT',
            'hostname': 'ginsheim.mozilla-iot.org',
            'path': `/things/${endpointId}/properties/${propertKey}`,
            'headers': {
                'Accept': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdjZTk2YjUxLWFhZDMtNGU3Ny1iY2Q0LWE2MTI5OTU2NDEyZiJ9.eyJyb2xlIjoidXNlcl90b2tlbiIsImlhdCI6MTU5MTEwOTQ0MywiaXNzIjoiaHR0cHM6Ly9naW5zaGVpbS5tb3ppbGxhLWlvdC5vcmcifQ.Ghnj-bx7QOPB3qZnm5_yi8JYkTvIScTFP69FJiQVs8mvEQpYXhUfg99MPq0d2TnypKza_-jwh9i-59RoV80FNg',
                'Content-Type': 'application/json'
            },
            'maxRedirects': 20
        };

        var req = https.request(options, function(res) {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            res.on("end", function(chunk) {
                var body = Buffer.concat(chunks);
                try {
                    const value = JSON.parse(body.toString().replace('undefined', ''));
                    var responseHeader = request.directive.header;
                    responseHeader.namespace = "Alexa";
                    responseHeader.name = "Response";
                    responseHeader.messageId = responseHeader.messageId + "-R";

                    // get user token pass in request
                    const requestToken = request.directive.endpoint.scope.token;

                    var contextResult = {
                        "properties": [{
                            "namespace": "Alexa.PowerController",
                            "name": "powerState",
                            "value": value[`${propertKey}`] === true ? 'ON' : 'OFF',
                            "timeOfSample": "2017-09-03T16:20:50.52Z", //retrieve from result.
                            "uncertaintyInMilliseconds": 50
                        }]
                    };
                    var response = {
                        context: contextResult,
                        event: {
                            header: responseHeader,
                            endpoint: {
                                scope: {
                                    type: "BearerToken",
                                    token: requestToken
                                },
                                endpointId: "11487F"
                            },
                            payload: {}
                        }
                    };
                    log("DEBUG", "Alexa.PowerController", JSON.stringify(response));
                    context.succeed(response);
                }
                catch (error) {
                    log("Error JSON", error);
                    context.succeed({ error: error });
                }
            });

            res.on("error", function(error) {
                log("Error Request", error);
                context.succeed({ error: error });
            });
        });
        
        var postItem = {};
        postItem[`${propertKey}`] = (requestMethod === 'TurnOn') ? true : false;
        var postData = JSON.stringify(postItem);

        req.write(postData);

        req.end();


    }


    const getAlexaEndpoint = (thing) => {
        if (!Object.prototype.hasOwnProperty.call(thing, 'id')) return new Error('No thing id');
        /**
         * The alexa endpoint for discovery
         * @type {AlexaEndpoint}
         */
        let endpoint = {
            endpointId: '', // The identifier for the endpoint. The identifier must be unique across all devices for the skill. The identifier must be consistent for all discovery requests for the same device. An identifier can contain letters or numbers, spaces, and the following special characters: _ - = # ; : ? @ &. The identifier can't exceed 256 characters.
            manufacturerName: '', // The name of the manufacturer of the device. This value can contain up to 128 characters.
            description: '', // The description of the device. The description should contain the manufacturer name or how the device connects. For example, "Smart Lock by Sample Manufacturer" or "WiFi Thermostat connected via SmartHub". This value can contain up to 128 characters.
            friendlyName: '', // The name used by the user to identify the device. This value can contain up to 128 characters, and shouldn't contain special characters or punctuation. This field is required for all interfaces, with some exceptions. Check the documentation for your interface to see if this field is optional.
            displayCategories: [], // In the Alexa app, the category that your device is displayed in.
            additionalAttributes: {}, // Additional information about the endpoint. ( https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#additionalattributes-object )
            capabilities: [], // An array of capability objects; The capability interfaces that your skill supports for the endpoint, such as Alexa.BrightnessController or Alexa.PowerController
            // connections: {}, // Information about the methods that the device uses to connect to the internet and smart home hubs
            // relationships: {}, // The endpoints that an endpoint is connected to. For example, a computer endpoint might be connected to a home network endpoint
            cookie: {} // Information about the device that your skill uses. The contents of this property can't exceed 5000 bytes. The API doesn't read or use this data
        }

        // endpointId
        endpoint['endpointId'] = getThingId(thing['id']);
        
        // manufacturerName
        endpoint['manufacturerName'] = alexaEndpoint['manufacturerName'];

        // friendlyName
        if (Object.prototype.hasOwnProperty.call(thing, 'title')) {
            endpoint['friendlyName'] = 'Webthing - ' + thing['title'].substring(0, 127);
        }

        // description
        if (Object.prototype.hasOwnProperty.call(thing, 'description') && thing['description'].length > 0) {
            endpoint['description'] = 'Webthing - ' + thing['description'].substring(0, 127);
        }
        else {
            endpoint['description'] = endpoint['friendlyName'];
        }

        // displayCategories
        endpoint['displayCategories'] = getAlexaDisplayCategories(thing);
        if (endpoint['displayCategories'].length === 0) return new Error("No display categories")

        // additionalAttributes
        // endpoint['additionalAttributes'] = getAlexaAdditionalAttribute(thing);

        // capabilities
        endpoint['capabilities'] = getAlexaCapabilities(thing);
        if (endpoint['capabilities'].length === 0) return new Error("No capabilities categories")

        // connections
        // endpoint['connections'] = {};

        // relationships
        // endpoint['relationships'] = {};

        // cookie
        /* Additional information used later for StateReport and Update Property
           The cookie object should be as follows:
            endpoint['cookie'] = {
                instance: property
            }
            instance: Is the key of the property
            property: Property object from the things.properties[instance]
        */
        for (var index = 0; index < endpoint['capabilities'].length; index++) {
            const capability = endpoint['capabilities'][index];
            if (Object.prototype.hasOwnProperty.call(capability, 'cookie')) {
                endpoint['cookie'][capability['instance']] = capability['cookie']['interface'];
                delete capability['cookie'];
            }
        }

        return endpoint;
    }

    const getThingId = (id) => {
        return id.replace(`${WEBTHING_SERVER}/things/`, '').substring(0, 255)
    }

    const getAlexaDisplayCategories = (thing) => {
        const alexaCategories = [];


        if (!Object.prototype.hasOwnProperty.call(thing, '@type')) return alexaCategories;

        for (let index = 0; index < thing['@type'].length; index++) {
            const type = thing['@type'][index];

            switch (type) {
                case 'TemperatureSensor':
                    alexaCategories.push('TEMPERATURE_SENSOR');
                    break;
                case 'SmartPlug':
                    alexaCategories.push('SMARTPLUG');
                    break;
            }
        }
        return alexaCategories;
    }

    const getAlexaAdditionalAttribute = (thing) => {
        const additionalAttributes = {
            "manufacturer": '', // The name of the manufacturer of the device. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
            "model": '', // The name of the model of the device. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
            "serialNumber": '', // The serial number of the device. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
            "firmwareVersion": '', // The firmware version of the device. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
            "softwareVersion": '', // The software version of the device. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
            "customIdentifier": '' // Your custom identifier for the device. This identifier should be globally unique in your systems across different user accounts. This value can contain up to 256 alphanumeric characters, and can contain punctuation.
        };


        if (Object.prototype.hasOwnProperty.call(thing, 'id')) additionalAttributes['customIdentifier'] = getThingId(thing['id']);

        return additionalAttributes;

    }

    const getAlexaCapabilities = (thing) => {
        /**
         * Alexa capabilities list
         * @type {AlexaCapability[]}
         */
        const alexaCapabilities = [];

        if (!Object.prototype.hasOwnProperty.call(thing, 'properties')) return alexaCapabilities;

        for (const propertyKey in thing['properties']) {
            const property = thing['properties'][`${propertyKey}`];
            if (!Object.prototype.hasOwnProperty.call(property, '@type')) continue;

            /**
             * The alexa capability for the thing's property
             * @type {AlexaCapability}
             */
            let alexaCapability = {
                "type": "AlexaInterface",
                "interface": "Alexa.",
                "instance": "Webthing",
                "version": "3",
                "properties": {
                    "supported": [{
                        "name": "temperature"
                    }],
                    "proactivelyReported": true,
                    "retrievable": true
                },
                // "capabilityResources": {},
                // "configuration": {},
                // "semantics": {}
                "cookie": {}
            };
            const alexaStandardCapability = {
                "type": "AlexaInterface",
                "interface": "Alexa",
                "version": "3"
            };

            switch (property['@type']) {
                case 'TemperaturePropertyTES':
                    // Alexa.TemperatureSensor Interface
                    // https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-temperaturesensor.html
                    alexaCapability.interface = 'Alexa.TemperatureSensor';
                    property.interface = 'Alexa.TemperatureSensor';
                    alexaCapability.instance = propertyKey;

                    // The temperature property
                    // The Alexa.TemperatureSensor interface uses temperature as the primary property. The property is expressed as a temperature.
                    // https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-temperaturesensor.html#properties
                    alexaCapability.properties = {
                        'supported': [{
                            name: 'temperature'
                        }],
                        // "proactivelyReported": true,
                        "retrievable": true,
                    };

                    // Cookie to get additional information
                    alexaCapability.cookie = property;

                    alexaCapabilities.push(alexaStandardCapability);
                    alexaCapabilities.push(alexaCapability);
                    break;
                case 'OnOffProperty':
                    // Alexa.PowerController Interface
                    // https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html
                    alexaCapability.interface = 'Alexa.PowerController';
                    property.interface = 'Alexa.PowerController';
                    alexaCapability.instance = propertyKey;
                    // The powerState property
                    // The Alexa.PowerController interface uses the powerState property as the primary property. The valid values are ON or OFF.
                    // https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#properties
                    alexaCapability.properties = {
                        'supported': [{
                            name: 'powerState'
                        }],
                        // "proactivelyReported": true,
                        "retrievable": true,
                    };

                    // Cookie to get additional information
                    alexaCapability.cookie = property;

                    alexaCapabilities.push(alexaStandardCapability);
                    alexaCapabilities.push(alexaCapability);
                    break;
                default:
                    break;
            }
        }
        return alexaCapabilities;
    }
};