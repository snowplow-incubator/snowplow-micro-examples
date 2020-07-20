# snowplow-micro-examples
Examples of how to apply [Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro) to popular build/test strategies

![testing with Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro-examples/workflows/testing%20with%20Snowplow%20Micro/badge.svg)


## 1. Local setup

### 1.1 Prerequisites
We recommend setting up the following three tools before starting:

 - Docker and Docker-compose
 - Npm
 - Python 3 and pip


### 1.2 Clone this repository and start Snowplow Micro

```
$ git clone https://github.com/snowplow-incubator/snowplow-micro-examples.git

$ cd snowplow-micro-examples

$ docker-compose up
```

This will pull Micro's docker image, mount the `micro` and `local-iglu` folders in the Docker container and set the port 9090 for access.
1. Inside the `micro` folder are the [configuration for Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/micro/micro.conf) and the [configuration for Iglu resolvers](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/micro/iglu.json).
2. The `local-iglu` folder, serves as a local [Iglu](https://github.com/snowplow/iglu) repository, having the necessary structure:

```
    schemas/{vendor}/{schema-name}/jsonschema/{schema-version}
```

Now [Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro) is up on localhost:9090 offering the 4 endpoints: `/micro/all`, `/micro/good`, `/micro/bad` and `/micro/reset`.

**Additional resources:**
 - [Iglu](https://github.com/snowplow/iglu) and [Iglu client configuration](https://github.com/snowplow/iglu/wiki/Iglu-client-configuration)
 - [Self-describing JSON Schemas](https://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/) and [SchemaVer](https://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/)
 - Snowplow Micro's [REST API](https://github.com/snowplow-incubator/snowplow-micro#3-rest-api)
 - Another [Docker Compose Example](https://github.com/snowplow/iglu/blob/release/0.6.0/2-repositories/iglu-server/docker/docker-compose.yml)


### 1.3 Install dependencies and start serving the app

```
$ pwd
/home/user/snowplow-micro-examples

$ pip3 install -r app/requirements.txt

$ python3 app/manage.py runserver 8000

$ npm install
```
You can now visit the app on http://localhost:8000 . You can then see the events being tracked from the app on [Micro's API endpoints](https://github.com/snowplow-incubator/snowplow-micro#3-rest-api).


### 1.4 Run the tests

To quickly see the tests running:

For [Nightwatch](https://nightwatchjs.org/):
```
$ npm test
```

For [Cypress](https://www.cypress.io/):
```
$ npm run cypress:run
```
And to open Cypress' Test Runner:
```
$ npm run cypress:open
```

## 2. Tracking Design

### 2.1 Overview of the app

The example application is a simple ecommerce app consisting of just 3 pages:

 1. a start page with a sample login form (no authentication involved - see also the **Note** below)
 2. the shop page (also containing the cart)
 3. the confirmation page

**Note:**

The form of the login-page is only for demonstrating the tracking of form events (which can also show that password fields are not being tracked). There is no authentication involved. While you can type anything and continue to the shop-page, we recommend that you do not use any personal data.

Each page serves the purpose of demonstrating possible event-tracking, which will then be tested using Snowplow Micro and a test tool.

### 2.2 Event dictionary

Using the [JavaScript Tracker](https://github.com/snowplow/snowplow/wiki/javascript-tracker):
```
<!-- Snowplow starts plowing -->
<script type="text/javascript">
;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window, document, "script", "{% static 'ecommerce/js/sp.js' %}", "snowplow"));
```
, the tracking implemented consists of:

1. [Pageview tracking](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#31-pageviews)

    - This event happens when a user visits a page.
    - It is a predefined Snowplow event, that automatically captures the URL, referrer and page title.
    - Method call:
    ```
    window.snowplow('trackPageView');
    ```
    - Implemented in all 3 pages.

2. [Activity Tracking](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#32-track-engagement-with-a-web-page-over-time-page-pings)

    - This event happens when a user engages with a page (e.g. user scrolls).
    - It is a predefined Snowplow event, that automatically records the maximum scroll left-right, up-down in the last ping period.
    - Method call (before the trackPageView method call):
    ```
    window.snowplow('enableActivityTracking', minimumVisitLength, heartBeat );
    ```
    - Implemented in login-page and shop-page, with different `minimumVisitLength` and `heartBeat`:
    ```
    // login-page
    window.snowplow('enableActivityTracking', 20, 20);

    // shop-page:
    window.snowplow('enableActivityTracking', 10, 10);
    ```

3. [Form Tracking](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#310-form-tracking)
    - This set of events happens when a user interacts with a web form (e.g. focus on an form element, change a value of input-textarea-select element form, submit a form)
    - These are predefined Snowplow events that are of unstructured eventType and can be customized. Data captured:
        - **focus_form**: id, classes of the form and name, type, value of the form element that received focus.
        - **change_form**: name, type, new value of the element, id of the parent form
        - **submit_form**: id, classes of the form and name, type, value of all form elements
    - Implemented in the login-page:
    ```
    var config = {
        forms: {
            blacklist: []
        },
        fields: {
            blacklist: ['user_password']
        }
    };

    window.snowplow('enableFormTracking', config);
    ```
    - Note: By default, Form Tracking does not track password fields. We used the above `config` to demonstrate how you can ensure the Non-tracking of sensitive fields. With Snowplow Micro we can also later test that any blacklisting of forms is implemented correctly and that no sensitive fields are tracked.

4. [Tracking custom self-describing(unstructured) events](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#37-tracking-custom-self-describing-unstructured-events)

    1. cart-events ([schema](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/local-iglu/schemas/test.example.iglu/cart_action_event/jsonschema/1-0-0))
        - These events happen when a user interacts with the cart, adding or removing items, using the Add-to-cart or Remove buttons.
        - This is a self-describing event that captures the type of cart interaction: "add" versus "remove".
        - We also want to add as [custom context](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2217-adding-predefined-contexts) the product involved in the cart-event, which is described by the product entity ([schema](https://github.com/snowplow-incubator/snowplow-micro-examples/tree/develop/local-iglu/schemas/test.example.iglu/product_entity/jsonschema), see more below)
        - Implemented in the shop-page (see file [homepage.js](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/app/static/ecommerce/js/homepage.js)):
        ```
        // TRACK cart_action_event (add) - homepage.js line 129
        window.snowplow('trackSelfDescribingEvent', {
                schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                data: {
                    type: "add",
                }
            },
            [{
                schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                data: {
                    sku: sku,
                    name: title,
                    price: parseFloat(price),
                    quantity: parseInt(quantity)
                }
            }]
        );

        // TRACK cart_action_event (remove) - homepage.js line 43
        window.snowplow('trackSelfDescribingEvent', {
                schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                data: {
                    type: "remove"
                }
            },
            [{
                schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                data: {
                    sku: sku,
                    name: title,
                    price: parseFloat(price),
                    quantity: parseInt(quantity)
                }
            }]
        );
        ```

    2. purchase-event ([schema](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/local-iglu/schemas/test.example.iglu/purchase_event/jsonschema/1-0-0))
        - These events happen when a user completes the purchase of the products in their cart by clicking the Purchase button.
        - This is a self-describing event that captures the total amount of the transaction.
        - We also want to add as [custom contexts](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2217-adding-predefined-contexts) the products involved, each of which is described by the product entity ([schema](https://github.com/snowplow-incubator/snowplow-micro-examples/tree/develop/local-iglu/schemas/test.example.iglu/product_entity/jsonschema), see more below)
        - Implemented in the shop-page (see file [homepage.js](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/app/static/ecommerce/js/homepage.js)):
        ```
        // create the contexts array - homepage.js line 175
        let productsContext = [];
        userCart.forEach(function(elt) {
            productsContext.push({
                schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                data: {
                    sku: elt.itemSku,
                    name: elt.itemTitle,
                    price: parseFloat(elt.itemPrice),
                    quantity: parseInt(elt.itemQuant)
                }
            });
        });

        // TRACK purchase_event - homepage.js line 191
        window.snowplow('trackSelfDescribingEvent', {
                schema: 'iglu:test.example.iglu/purchase_event/jsonschema/1-0-0',
                data: {
                    total: parseFloat(total)
                }
            },
            productsContext);
        ```

5. Custom contexts

    - [Predefined Context](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2217-adding-predefined-contexts) [webPage]
    - Product Entity ([schema](https://github.com/snowplow-incubator/snowplow-micro-examples/tree/develop/local-iglu/schemas/test.example.iglu/product_entity/jsonschema)). This entity captures the data on a product involved in a cart or purchase event: sku, name, price, quantity.


**Additional resources:**

- [Snowplow Docs](https://docs.snowplowanalytics.com/)
- [Designing your Tracking](https://docs.snowplowanalytics.com/docs/understanding-tracking-design/)


## 2. Testing with Snowplow Micro

The purpose of this repo is to show that micro is operating in the way we would expect for a given application - showing no bad events, sending the correct events in the correct format, and retriving the correct data for every tracker.
This repo therefore shows you how to set up trackers, how to make customised (unstructured) events, and structured events, as well as adding in tests in both nightwatch and cypress to demonstate the capabilities of micro.


#### The tests implemented in this repo are:

1) No bad events
2) Number of good events = number of expected good events
3) Ensuring that total number of events is right - expected number of good events + bad events (noBadEvents = True)
4) Checking proper values of structured and unstructured events are sent to micro
5) Test which shows that tracker is successfully sent to micro, and successfully received - used by checking name of event is sent to micro
6) Event With Property test - context, event type and schema
	- user puts in an event and we match by all 3 conditions (contexts, properties and schema - this determines whether or not the fake test event is equal to the one on micro - for both structured and unstructured)
7) Race condition test - to ensure that event x is always sent to micro before event y (in our case we wanted to ensure cart action occurred before purchase)


### 2.1 Setting up Nightwatch
Powered by Node.js, Nightwatch.js is an open-source automated testing framework that aims at providing complete E2E (end to end) solutions to automate testing with Selenium Javascript for web-based applications, browser applications, and websites.

This framework relies on Selenium and provides several commands and assertions within the framework to perform operations on the DOM elements.

#### How does Nightwatch JS work?
Nightwatch communicates over a restful API protocol that is defined by the W3C WebDriver API. It needs a restful HTTP API with a Selenium JavaScript WebDriver server.
In order to perform any operation i.e. either a command or assertion, Nightwatch usually requires sending a minimum of two requests.

It works as follows:

- The first request locates the required element with the given XPath expression or CSS selector.
- The second request takes the element and performs the actual operation of command or assertion.

#### Getting Started

```
$ git init
$ npm init -y
$ npm install nightwatch --save-dev
$ npm install chromedriver --save-dev
```
1. Create default json package
2. Create node modules folder and add nightwatch to dev dependencies
3. Add nightwatch.conf.js file (must contain basic configuration file)
4. Add a chrome driver binary for nightwatch configs - adds it into node modules - allows us to send commands to the chrome driver

Running nightwatch:
```
npm test
```


### 2.2 Snowplow Micro and Cypress

[Cypress](https://www.cypress.io/) is an open [source](https://github.com/cypress-io/cypress) JavaScript End-to-End testing framework with extensive [documentation](https://docs.cypress.io/).
In this section we note few things that are specifically related to using this test tool with Snowplow Micro, describe the rationale behind the tests' organization used in this example and document the commands used.

#### 2.2.1 Introduction

Generally, a test involves 3 phases:
1. Prepare a state
2. Take an action
3. Assert on the resulting state

While Cypress considers as state the application's state, it is still a fact that an app is rarely an isolated system without side effects.

This is especially true when a tracking strategy is implemented, which means that any action can fire [events](https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol) through the [trackers](https://github.com/snowplow/snowplow/wiki/trackers). There is an increasing number of reports (see Gartner) highlighting the importance of upstream data quality and Data Ops, which means that testing your Data Collection and trackers' implementation besides your product's features is of highest priority. Tracking is as important as your shipping, and that is why it is highly recommended that you include its testing in your E2E tests.

Cypress, even though it considers as [best practice](https://docs.cypress.io/guides/references/best-practices.html#Visiting-external-sites) to avoid requiring or testing 3rd party services, it still offers the ability to "talk" to 3rd party API's via [cy.request()](https://docs.cypress.io/api/commands/request.html), that:
 - entirely bypasses CORS
 - expects the server to exist and provide a response
 - does not retry its assertions (as that could affect external state)
, which makes it great to use for querying Snowplow Micro's endpoints.
For example:
```
    cy.request({
        url: 'http://localhost:9090/micro/all',
        json:true
    });
```

So, following on the 3 test's phases:
1. Preparing state:
    1. Reset Micro
    2. Configure Cypress to visit your app
2. Actions:
    Cypress interacts with the app creating events
3. Assertions:
    Cypress sends requests to Micro, and attempts assertions on the responses



#### 2.2.2 Tests' organization

Another Cypress' recommendation for best [practices](https://docs.cypress.io/guides/references/best-practices.html#Having-tests-rely-on-the-state-of-previous-tests) is the decoupling of tests, which, for the case of testing with Snowplow Micro, would mean to run both the state-changing and the micro-requests in the same spec file.
However, there were some issues in doing so. More specifically, those issues had only to do with cases where links (or submit buttons) were clicked, in other words in cases where a window [unload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event) was fired.

To describe the issue, we first describe what normally happens upon an unload event:
When a user clicks, for example, a link, on one hand the browser wants to navigate on the link, and on the other hand, the tracker (in our case the [Javascript Tracker](https://github.com/snowplow/snowplow/wiki/javascript-tracker)) tries to send the [link click](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#39-link-click-tracking) or the [submit form](https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#310-form-tracking) events, while also storing them in local storage, just in case the events don't get sent before the page unloads.
While it is normal for browsers to cancel all requests, a cancelled request does not necessarily mean that the request did not reach the server, but that the client sending it, does not wait for an answer anymore. So, there is no way to know from client side whether the request (be it POST or GET) succeeded.

That problem was especially apparent when Micro was being queried in the same spec file with the app's actions. For example, POST requests appeared as cancelled in Cypress' test runner, but the events may have reached Micro.
Taking advantage of the fact that Cypress also clears browser cache when it changes spec file (see also this [issue](https://github.com/cypress-io/cypress/issues/686)), we decided to move the testing part of Micro into separate spec files.

The consequences of this decision are:
1. You need to ensure a naming strategy, and the reason for this is the fact that Cypress decides the order of execution for test files based on alphabetical order. In this example, we use this naming strategy:
 - `xx_app_spec.js` for the spec files that visit the app and create events
 - `xx_micro_spec.js` for the spec files that query micro and make the assertions on those events
, where `xx` stands for numbering (but it could be anything as long as it matches uniquely).

```
$ tree testing/cypress/integration

testing/cypress/integration/
├── 01_app_spec.js
├── 01_micro_spec.js
├── 02_app_spec.js
├── 02_micro_spec.js
├── 03_app_spec.js
├── 03_micro_spec.js
```

2. You need to consider how and when you reset Micro. We chose to use a Before [hook](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Hooks) in the start of every `xx_app_spec.js` file, since the naming strategy ensures that the tests will run in `app`-`micro` pairs.
3. If you just want to run only a particular app test file (and not all of them), you will also need its corresponding micro test file. Since this is a usual case, for example, when a particular spec file fails, we added another npm script `cy-micro:pair-run`, which will match a naming pattern and run the corresponding micro spec file after the matching app spec. The script can be seen in [package.json](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/package.json).

Example usage:
1. To run all spec files in your `cypress/integration` folder (in alphabetical order)
```
$ npm run cypress:run
```

2. To run an app-micro pair of spec files given a name pattern
```
PAIR_PATTERN=03 npm run cy-micro:pair-run  # will run first the 03_app_spec.js and then the 03_micro_spec.js
```
Just make sure that this name pattern is unique for this pair.

This kind of organization also has the benefit, that you can keep having the tests you normally had for your app (just adding the before-hook to reset Micro), and just add a corresponding micro-spec file, to test the events emitted from the original run of that app test. That way, you can test your app's features in the `app_spec` files and your tracking implementation in the corresponding `micro_spec` files.

**Additional resources**:
1. [a cypress issue describing a similar situation](https://github.com/cypress-io/cypress/issues/2968)
2. [Beacon](https://w3c.github.io/beacon/#sendbeacon-method)
3. From Snowplow's JavaScript tracker's documentation [1](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2212-setting-the-page-unload-pause), [2](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#22181-beacon-api-support), [3](https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#2218-post-support)



#### 2.2.3 Commands

Since Cypress allows to define your own [custom commands](https://docs.cypress.io/api/cypress-api/custom-commands.html), in this repo you can find commands specifically for use with Snowplow Micro and assertions of events. You can see them all in [commands.js](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/testing/cypress/support/commands.js).

#### .noBadEvents

*Example call*:

```
    cy.noBadEvents();
```
*Arguments*: None

Even if this is the only thing that you check in your tests, you are already brilliant. It is going to ensure that your app is not sending any bad events, in other words you ensure that all your events end up in your warehouse. There are no more gaps in your data or in your analytics and no recovery jobs to get those bad events back, jobs that are not going to be trivial, especially if you are dealing with high volume of events.

#### .numGoodEvents

*Example call*:

```
cy.numGoodEvents( 19 );
```
*Arguments*:
 - int >= 0, the number of good events you expect

This command ensures that all the events you want to track, actually get tracked. Because there may be not bad events, but maybe your tracker is not implemented correctly into the app's logic.

#### .eventsWithEventType

*Example call*:

```
    cy.eventsWithEventType( "pv", 8 );
    cy.eventsWithEventType( "se", 45 );
```
*Arguments*:
 - string, the eventType you want to match against
 - int >= 0, the number of matching events you expect

This command is useful when you want to ensure that a particular type of events got tracked as many times as it should.

#### .eventsWithParams

*Example call*:

```
    cy.eventsWithParams(
        {
            "e": "se",
            "se_ca": "Media",
            "se_ac": "Play video",
            "se_la": "Surfing"
        }, 3 );
```
*Arguments*:
 - Object (parameter-value pairs)
 - int >= 0, the number of matching events you expect

This command accepts as first argument an object with parameter-value pairs. You can see all available parameters in the [Snowplow Tracker Protocol](). This command is particularly useful when checking on [structured events]().

#### .eventsWithSchema

*Example call*:

```
    cy.eventsWithSchema( "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0", 5 );
```
*Arguments*:
 - string, the Schema you are looking for
 - int >= 0, the number of matching events you expect

 With this command you can look specifically for [unstructured events](https://docs.snowplowanalytics.com/docs/understanding-tracking-design/understanding-schemas-and-validation/), which include both custom unstructured [events](https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#310-custom-unstructured-event-tracking) and all other default Snowplow events that are of "ue" eventType (link-click, submit-form ad-impression etc.)

#### .eventsWithContexts

*Example call*:

```
    cy.eventsWithContexts( [ { "schema": "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0" } ], 10 );

    cy.eventsWithContexts(
            [
                {
                    "schema": "iglu:com.example.eg/article_context/jsonschema/1-0-0",
                    "data": {
                        "writer": "John Doe",
                        "category": "Sports",
                        "title": "The match of the year"
                    }
                },
                {
                    "schema": "iglu:com.example.eg/writer_entity/jsonschema/1-0-0",
                    "data": {
                        "name": "John Doe",
                        "age": 34,
                        "numOfArticles": 50,
                        "categories": ["sports", "history", "food"]
                    }
                }
            ], 2 );
```
*Arguments*:
 - Array of contexts (see below)
 - int >= 0, the number of matching events you expect

With this command you can check whether the predefined(e.g. webpage, geolocation) or [custom](https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#4-custom-contexts) contexts/entities got properly attached to events. You can not only check by the schema of the entities but also by their data. Note that the first argument to this command should be an array of objects, like the contexts' array that can be attached to any Snowplow event. The keys of these objects can be either "schema" or "data". For "schema" the value should be a string (the schema). For "data" the value should be an object of key-value pairs, depending on the context.

#### .eventsWithProperties

*Example call*:
```
    cy.eventsWithProperties({

            "parameters": {
                "e": "ue",
                "tv": "js-2.15.0"
            }
            "schema": "iglu:com.example.eg/custom_cart_event/jsonschema/1-0-0",
            "values": {
                "type": "add",
                "productSku": "12345",
                "quantity": 1
            },
            "contexts": [
                {
                    "schema": "iglu:com.example.eg/custom_product_context/jsonschema/1-0-0",
                    "data": {
                        "sku": "12345",
                        "name": "Laptop",
                        "onOffer": false,
                    },
                }
            ]

        }, 1 );
```
*Arguments*:
 - Object with specific keys (see below)
 - int >= 0, the number of matching events you expect

This is a command that combines some of the above (eventsWithSchema, eventsWithParams, eventsWithContexts), and also adds the ability to look into the data of unstructured events.
The object that gets passed as the first argument, can have as keys:
 - "schema" : matches by schema
 - "values" : matches by the data of an unstructured event
 - "contexts" : matches by contexts
 - "parameters" matches by parameters
It will return the events that have all those properties.
As shown in the examples above, you do not have to use all the properties, and the command works accordingly.


#### 2.2.4 Some further notes

```
$ tree testing/cypress/

testing/cypress/
├── integration
│   ├── 01_app_spec.js
│   ├── 01_micro_spec.js
│   ├── 02_app_spec.js
│   ├── 02_micro_spec.js
│   ├── 03_app_spec.js
│   ├── 03_micro_spec.js
│   └── helpers_spec.js
├── plugins
│   └── index.js
└── support
    ├── commands.js
    └── index.js
```

1. Helpers
    - In the `commands.js` file, the commands are defined based on the `Micro` [helper module](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/testing/jsm/helpers.js)
    - The `integration/helpers_spec.js` [file](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/testing/cypress/integration/helpers_spec.js) tests the helper functions that define the matching logic. For a different custom matching logic, you can tweak the helper functions, and then test them.
    - As a note, you don't need to set `encodeBase64: false` in your tracker configuration [parameters](https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/general-parameters/initializing-a-tracker-2/), in order for the matching to work.

2. Environment variables.
    - Cypress allows for [many ways](https://docs.cypress.io/guides/guides/environment-variables.html) to set environment variables. In this example we set them in the `plugins/index.js` [file](https://github.com/snowplow-incubator/snowplow-micro-examples/blob/develop/testing/cypress/plugins/index.js).



## 3. Github Actions
Inside the `.github/workflows/` folder you can find the `.yml` files we use to test this exaple app with Micro and Nightwatch/Cypress. The steps are broken so that you can use any that you need.
A general workflow file would definitely use the [Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro) step, which currently is:

```
- name: Start Micro
        run: |
          cd $GITHUB_WORKSPACE/snowplow-micro-examples
          docker-compose up -d
```
In order to use it, as it is, you will need:
1. the `docker-compose.yml` file
2. a `micro/` forder with a `micro.conf` and a `iglu.json` configuration for Micro and Iglu respectively
3. a `local-iglu` folder to serve as local Iglu repository.

If you do not want to use `docker run` instead of `docker-compose`, you can make the step as:
```
- name: Start Micro
        run: |
          cd $GITHUB_WORKSPACE/snowplow-micro-examples
          docker run --mount type=bind,source=$(pwd)/micro,destination=/config --mount type=bind,source=$(pwd)/local-iglu,destination=/local-iglu -p 9090:9090 snowplow/snowplow-micro:latest --collector-config /config/micro.conf --iglu /config/iglu.json &
```

You will still need to provide a configuration for Micro and Iglu.

If you do not have a `local-iglu` setup, you'll just need to not use the second mount.
