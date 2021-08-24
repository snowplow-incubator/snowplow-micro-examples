# snowplow-micro-examples

[![testing with Snowplow Micro][gh-actions-image]][gh-actions]
[![License][license-image]][license]

Test that your website is tracking [Snowplow][snowplow] events correctly.

## Quick start

```bash
# Launch the web app that we want to test:
docker-compose up -d web

# Launch snowplow micro
docker-compose up -d micro

# Run integration tests for snowplow tracking:
npm test
```

Did all tests pass? Then confidently push your web app to production!

Examples of how to apply [Snowplow Micro][snowplow-micro] to popular build/test strategies.

Current Snowplow Micro version: 1.2.1
If you have been using a previous version (v0.x) of Snowplow Micro in your test suites, you can also read the [Upgrading Micro](#6-upgrading-micro-from-v0x-to-v1) section.

## Table of Contents

[Snowplow Micro](#snowplow-micro)

[1. Local setup](#1-local-setup)

[2. Github Actions](#2-github-actions)

[3. Tracking design](#3-tracking-design)

- [3.1 Overview of the demo app](#31-overview-of-the-demo-app)
- [3.2 Event dictionary](#32-event-dictionary)

[4. Testing with Snowplow Micro](#4-testing-with-snowplow-micro)

- [4.1 Snowplow Micro and Nightwatch](#41-snowplow-micro-and-nightwatch)
- [4.2 Snowplow Micro and Cypress](#42-snowplow-micro-and-cypress)

[5. Additional resources](#5-additional-resources)

[6. Upgrading Micro](#6-upgrading-micro-from-v0x-to-v1)

## Snowplow Micro

[Snowplow Micro][snowplow-micro-docs] is a very small version of a full [Snowplow][snowplow-docs] data collection pipeline that can be embedded in automated test suites and so enable Snowplow users to test their data collection setup and then release new versions of their apps, websites and servers with confidence that new changes won’t break the tracking set up. Snowplow Micro comes to fill a missing piece in automated test suites: the tests that validate that data collection has been setup properly.

To check data collection, it is necessary to fire a set of events, process them and see if the output of that processing is as expected. Snowplow Micro is easy to integrate with your test tool and then run as part of your automated testing workflow. This repository aims to show in detail all the steps to do this using Nightwatch and Cypress as examples of test tools, to build end-to-end GitHub Actions testing workflows.

## 1. Local setup

### 1.1 Prerequisites

We recommend setting up the following tools before starting:

- Git
- Docker and Docker-compose
- Npm

### 1.2 Clone this repo, start Snowplow Micro and serve the app

```bash
git clone https://github.com/snowplow-incubator/snowplow-micro-examples.git

cd snowplow-micro-examples

docker-compose up
```

This will:

1. Start serving the app on localhost:8000
2. Launch Snowplow Micro, mounting the `micro` directory and setting the port 9090 for accessing the 4 endpoints: `/micro/all`, `/micro/good`, `/micro/bad` and `/micro/reset`.
   Inside the `micro` directory are:
    1. The [configuration for Snowplow Micro](./micro/micro.conf) and
    2. The [configuration for Iglu resolvers](./micro/iglu.json)

### 1.3 Install npm dependencies

```bash
npm install
```

This step will install Nightwatch and Cypress.

### 1.4 Run the tests

Our demo web app uses snowplow to track user activity. We will be testing that tracking is properly configured on our site.

To run all tests:

```bash
npm test
```

For running only [Nightwatch][nightwatch] tests:

```bash
npm run test:nightwatch
```

For running only [Cypress][cypress] tests:

```bash
# From the command line
npm run cypress:run

# To launch the Test Runner
npm run cypress:open
```

## 2. Github Actions

Inside the `.github/workflows/` directory you can find the `.yml` files we use to test this exaple app with Micro and Nightwatch/Cypress.
A general workflow file would definitely use the [Snowplow Micro][snowplow-micro-docs] step, which for our example is:

```text
- name: Start Micro
    run: docker-compose up -d
    working-directory: snowplow-micro-examples
```

In order to use it, just make sure that:

1. Your `working-directory` contains the `micro/` directory that Micro will mount, containing a `micro.conf` and a `iglu.json` configuration for Micro and Iglu respectively.

2. Your `docker-compose.yml` file is adjusted accordingly

If you wanted to use `docker run` instead of `docker-compose`, the same step would be:

```text
- name: Start Micro
    run: docker run --mount type=bind,source=$(pwd)/micro,destination=/config -p 9090:9090 snowplow/snowplow-micro:1.0.0 --collector-config /config/micro.conf --iglu /config/iglu.json &
    working-directory: snowplow-micro-examples
```

## 3. Tracking design

Our demo web app uses Snowplow to track user activity. Then, using Snowplow Micro we will be testing that tracking is properly configured on our site using, as examples, two populat web test tools, Nightwatch and Cypress.

### 3.1 Overview of the demo app

The example application is a simple ecommerce app consisting of just 3 pages:

1. A start-up page with a sample login form (no authentication involved - see also the **Note** below)
2. The shop page including a same-page cart
3. The purchase-confirmation page

> **Note:**
> The form of the login-page is only for demonstrating the tracking of form events (which can also show that password fields are not being tracked). There is no authentication involved. While you can type anything and continue to the shop-page, we recommend that you do not use any personal data.

Each page serves the purpose of demonstrating possible event-tracking, which will then be tested using Snowplow Micro and a test tool.

### 3.2 Event dictionary

Using the [JavaScript Tracker][javascript-tracker]:

```html
<!-- Snowplow starts plowing -->
<script type="text/javascript">
;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
n.src=w;g.parentNode.insertBefore(n,g)}}(window, document, "script", "{% static 'ecommerce/js/sp.js' %}", "snowplow"));
```

The tracking implemented consists of:

1. [Pageview tracking][pageview-tracking]

    - This event happens when a user visits a page.
    - It is a predefined Snowplow event, that automatically captures the URL, referrer and page title.
    - Method call:

    ```javascript
    window.snowplow('trackPageView');
    ```

    - Implemented in all 3 pages.

2. [Activity Tracking][activity-tracking]

    - This event happens when a user engages with a page (e.g. user scrolls).
    - It is a predefined Snowplow event, that automatically records the maximum scroll left-right, up-down in the last ping period.
    - Method call (before the `trackPageView` method call):

    ```javascript
    window.snowplow('enableActivityTracking', {
        minimumVisitLength: number,
        heartbeatDelay: number
    });
    ```

    - Implemented in login-page and shop-page, with different `minimumVisitLength` and `heartBeat`:

    ```javascript
    // login-page
    window.snowplow('enableActivityTracking', {
        minimumVisitLength: 20,
        heartbeatDelay: 20
    });

    // shop-page:
    window.snowplow('enableActivityTracking', {
        minimumVisitLength: 10,
        heartbeatDelay: 10
    });
    ```

3. [Form Tracking][form-tracking]

    - This set of events happens when a user interacts with a web form (e.g. focus on an form element, change a value of input-textarea-select element form, submit a form)
    - These are predefined Snowplow events that are of unstructured eventType and can be customized. Data captured:
        - **focus_form**: id, classes of the form and name, type, value of the form element that received focus.
        - **change_form**: name, type, new value of the element, id of the parent form
        - **submit_form**: id, classes of the form and name, type, value of all form elements
    - Implemented in the login-page:

    ```javascript
    var options = {
        forms: {
            denylist: []
        },
        fields: {
            denylist: ['user_password']
        }
    };

    window.snowplow('enableFormTracking', { options: options });
    ```

    > **Note**:
    > By default, Form Tracking does not track password fields. We used the above `config` to demonstrate how you can ensure the Non-tracking of sensitive fields. With Snowplow Micro we can also later test that any blacklisting of forms is implemented correctly and that no sensitive fields are tracked.

4. [Tracking custom self-describing(unstructured) events][self-describing-tracking]

    1. cart-events ([schema](./iglu/schemas/test.example.iglu/cart_action_event/jsonschema/1-0-0))
        - These events happen when a user interacts with the cart, adding or removing items, using the Add-to-cart or Remove buttons.
        - This is a self-describing event that captures the type of cart interaction: "add" versus "remove".
        - We also want to add as [custom context][custom-context] the product involved in the cart-event, which is described by the product entity ([schema](./iglu/schemas/test.example.iglu/product_entity/jsonschema/1-0-0), see more below)
        - Implemented in the shop-page (see file [shoppage.js](./app/static/ecommerce/js/shoppage.js)):

        ```javascript
        // TRACK cart_action_event (add)
        window.snowplow('trackSelfDescribingEvent', {
            event: {
                schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                data: {
                    type: 'add',
                },
            },
            context: [
                {
                    schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                    data: {
                        sku: sku,
                        name: title,
                        price: parseFloat(price),
                        quantity: parseInt(quantity)
                    }
                }
            ]
        });

        // TRACK cart_action_event (remove)
        window.snowplow('trackSelfDescribingEvent', {
            event: {
                schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                data: {
                    type: 'remove',
                },
            },
            context: [
                {
                    schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                    data: {
                        sku: sku,
                        name: title,
                        price: parseFloat(price),
                        quantity: parseInt(quantity)
                    }
                }
            ]
        });
        ```

    2. purchase-event ([schema](./iglu/schemas/test.example.iglu/purchase_event/jsonschema/1-0-0))
        - These events happen when a user completes the purchase of the products in their cart by clicking the Purchase button.
        - This is a self-describing event that captures the total amount of the transaction.
        - We also want to add as [custom contexts][custom-contexts] the products involved, each of which is described by the product entity ([schema](./iglu/schemas/test.example.iglu/product_entity/jsonschema/1-0-0), see more below)
        - Implemented in the shop-page (see file [shoppage.js](./app/static/ecommerce/js/shoppage.js)):

        ```javascript
        // create the contexts array
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

        // TRACK purchase_event
        window.snowplow('trackSelfDescribingEvent', {
            event: {
                schema: 'iglu:test.example.iglu/purchase_event/jsonschema/1-0-0',
                data: {
                    total: parseFloat(total),
                },
            },
            context: productsContext
        });
        ```

5. Custom contexts

- Predefined [webPage context][webpage-context] (enabled by default in JavaScript Tracker v3)
- Product Entity ([schema](./iglu/schemas/test.example.iglu/product_entity/jsonschema/1-0-0)). This entity captures the data on a product involved in a cart or purchase event: sku, name, price, quantity.

## 4. Testing with Snowplow Micro

The purpose of this repo is to show how Snowplow Micro can be used to validate that the tracking implemented in a demo app is operating in the way we expect.

Simulate particular situations, and check that:

- There are no bad events.
- The data sent is as expected.
- The right event data is sent with each event.
- The right entities / contexts are attached to each event.
- The right values are sent with each event.

In this repo you can also find information on how to set up trackers, how to make customised (unstructured) events, and, mainly, how to configure and add tests in your test tool of choice, using as examples the popular web test tools Nightwatch and Cypress, in order to demonstate the capabilities of Snowplow Micro.

**The tests implemented in this repo are:**

1) No bad events
2) Number of good events = number of expected good events
3) Ensuring that total number of events is right - expected number of good events + bad events (noBadEvents = True)
4) Checking proper values of structured and unstructured events are sent to Micro
5) Event With Property test - context, event type and schema - we match by all 3 conditions (contexts, properties and schema - this determines whether or not the fake test event is equal to the one on micro - for both structured and unstructured)
6) Race condition test - to ensure that event x is always sent to Micro before event y (in our case we wanted to ensure cart action occurred before purchase)
7) Form tracking test to ensure blacklisted form fields are not tracked, and to ensure the right properties are sent for each field

### 4.1 Snowplow Micro and Nightwatch

Powered by Node.js, [Nightwatch.js][nightwatch] is an open-source automated testing framework that aims at providing complete E2E (end to end) solutions to automate testing with Selenium Javascript for web-based applications, browser applications, and websites.

This framework relies on Selenium and provides several commands and assertions within the framework to perform operations on the DOM elements.

#### 4.1.1 How does Nightwatch JS work?

Nightwatch communicates over a restful API protocol that is defined by the W3C WebDriver API. It needs a restful HTTP API with a Selenium JavaScript WebDriver server.
In order to perform any operation i.e. either a command or assertion, Nightwatch usually requires sending a minimum of two requests.

It works as follows:

- The first request locates the required element with the given XPath expression or CSS selector.
- The second request takes the element and performs the actual operation of command or assertion.

#### 4.1.2 Getting Started

If you want to isolate Nightwatch JS testing, follow these steps, otherwise skip to [4.1.3 Simulating a User with Nightwatch](https://github.com/snowplow-incubator/snowplow-micro-examples#413-simulating-a-user-with-nightwatch).

Install nightwatch and a chrome driver which enables nightwatch to interact with the Chrome browser:

```bash
npm install nightwatch --save-dev
npm install chromedriver --save-dev
```

1. Create default json package
2. Create node modules folder and add nightwatch to dev dependencies
3. Add nightwatch.conf.js file (must contain basic configuration file)
4. Add a chrome driver binary for nightwatch configs - adds it into node modules - allows us to send commands to the chrome driver
5. Add `test:nightwatch` to the scripts section of the package.json
6. Write your own tests

Running nightwatch:

```bash
npm run test:nightwatch
```

#### 4.1.3 Simulating a User with Nightwatch

When using Nightwatch, one testing strategy is to simluate a user interaction with your app. This is useful so
that we can fire the exact events that a user would fire when using the app in the field.

In Nightwatch a test involves 3 phases:

1. Preparing a state:
    1. Reset Micro command - deleting the cache in Micro so that each test has independent events from other tests
    2. Configure Nightwatch to interact with your app
2. Taking an action:
    Nightwatch interacts with the app creating events
3. Making an assertion on the resulting state:
    Nighwatch requests the state of Micro and based on a test performs the corresponding assertions

#### 4.1.4 Organisation of tests

#### Commands

#### resetMicro

The resetMicro command can be added before each test as the beforeEach hook:
[Nightwatch Test Hooks][nightwatch-test-hooks]

*Example call*:

```javascript
module.exports = {
    beforeEach: function(browser) {
        browser
            .resetMicro();
    },
    "test1" :function (browser0 {
        // code here
    }
}
```

*Arguments*: None

This command utilises the ability to reset Micro through the `/micro/reset` endpoint.

This is the general structure of how to create a command which aims to request information from Snowplow Micro using Nightwatch:

```javascript
this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/all',
            json: true
        }, (err, res, body) => {
            if (err) {
                console.warn(error);
                return false;
            }
            callback(body);
        });
    };
```

#### Assertions

#### .noBadEvents

*Example call*:

```javascript
browser.assert.noBadEvents();
```

*Arguments*: None

This is arguably the most important assertion, if you only implement one this is a great place to start.
It ensures that all of your data is sent to Micro and ends up in good events, so all of your data is in your warehouse and you can interpret it as expected.

#### .noOfGoodEvents

*Example call*:

```javascript
browser.assert.noOfGoodEvents(2);
```

*Arguments*: Number of expected good events to be sent to Micro

An extension of noBadEvents, asserts that you sent the correct number of good events to Micro for a given event.
For example, you might expect the onClick() action to send 2 good events,
then you can make sure 2 are sent to good events and call noBadEvents on the same assertion as total number of events = number of good events + number of bad events.

#### .noOfTotalEvents

*Example call*:

```javascript
browser.assert.noOfTotalEvents(2);
```

*Arguments*: Number of expected total events sent to Micro

A further extension on noOfGoodEvents, this assertion ensures that both the correct number events are sent to Micro, and that no bad events are sent.
Using all 3 of these assertions consecutively provides the best assurance that every event you send is sent to your warehouse properly.

#### .orderOfEvents

*Example call*:

```javascript
browser.assert.orderOfEvents(events_list);

```

*Arguments*: events_list

Checks for when one event must be before the other so that your application works as expected.
This works by retrieving the derived timestamps for each event, and asserting that events fired in the specified order.
In our case we use this to test that a cart action occurs before purchasing an item.
If our application didn't get this order of events correct, then the application does not act as expected.
This can also be considered a race condition test.

#### .successfulEvent

*Example call*:

```javascript
browser.assert.successfulEvent({
            "eventType": "unstruct",
            "schema": "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0",
            "values": {
                "type": "remove"
            },
            "contexts": [{
                "schema": "iglu:test.example.iglu/product_entity/jsonschema/1-0-0",
                "data": {
                    "name": "One-size summer hat",
                    "price": 15.5,
                    "quantity": 1
                }
            }]
        });
```

*Arguments*: test_event (with schema, eventType, values and context), number_of_occurences

Ensures that when an event is sent to Micro the correct parameters are sent as expected.
In our case we check that the schema, properties and contexts are correct:

- We match what the user expects to be sent to what is received on Micro.
- In the end, the number of matched events is retrieved and asserted to the expected number of occurrences.
- By doing that, we can also specify which events we don't expect on Micro by setting the argument number_of_occurences=0.

### 4.2 Snowplow Micro and Cypress

[Cypress][cypress] is an open [source][cypress-repo] JavaScript End-to-End testing framework with extensive [documentation][cypress-docs].
In this section we note few things that are specifically related to using this test tool with Snowplow Micro, describe the rationale behind the tests' organization used in this example and document the commands used.

#### 4.2.1 Introduction

Generally, a test involves 3 phases:

1. Prepare a state
2. Take an action
3. Assert on the resulting state

While Cypress considers as state the application's state, it is still a fact that an app is rarely an isolated system without side effects.

This is especially true when a tracking strategy is implemented, which means that any action can fire [events][snowplow-tracker-protocol] through the [trackers][snowplow-trackers]. There is an increasing number of reports highlighting the importance of upstream data quality, automation and DataOps, which means that testing your Data Collection and trackers' implementation besides your product's features is of highest priority. Tracking is as important as your shipping, and that is why it is highly recommended that you include its testing in your E2E tests.

Cypress, even though it considers as [best practice][cypress-best-external] to avoid requiring or testing 3rd party services, it still offers the ability to "talk" to 3rd party API's via [cy.request()][cypress-request], that:

- Entirely bypasses CORS
- Expects the server to exist and provide a response
- Does not retry its assertions (as that could affect external state)

, which makes it great to use for querying Snowplow Micro's endpoints.
For example:

```javascript
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

#### 4.2.2 Tests' organization

Another Cypress' recommendation for best [practices][cypress-best-tests] is the decoupling of tests, which, for the case of testing with Snowplow Micro, would mean to run both the state-changing and the micro-requests in the same spec file.
However, there were some issues in doing so. More specifically, those issues had only to do with cases where links (or submit buttons) were clicked, in other words in cases where a window [unload event][unload-event] was fired.

To describe the issue, we first describe what normally happens upon an unload event:
When a user clicks, for example, a link, on one hand the browser wants to navigate to the link, and on the other hand, the tracker (in our case the [Javascript Tracker][javascript-tracker]) tries to send the [link click][link-click-tracking] or the [submit form][form-tracking] events, while also storing them in local storage, just in case the events don't get sent before the page unloads.
While it is normal for browsers to cancel all requests, a cancelled request does not necessarily mean that the request did not reach the server, but that the client sending it, does not wait for an answer anymore. So, there is no way to know from client side whether the request (be it POST or GET) succeeded.

That problem was especially apparent when Micro was being queried in the same spec file with the app's actions. For example, POST requests appeared as cancelled in Cypress' test runner, but the events may have reached Micro.
Taking advantage of the fact that Cypress also clears browser cache when it changes spec file (see also this [issue][cypress-issue]), we decided to move the testing part of Micro into separate spec files.

The consequences of this decision are:

1. You need to ensure a naming strategy, and the reason for this is the fact that Cypress decides the order of execution for test files based on alphabetical order. In this example, we use this naming strategy:

- `xx_app_spec.js` for the spec files that visit the app and create events
- `xx_micro_spec.js` for the spec files that query Micro and make the assertions on those events

, where `xx` stands for numbering (but it could be anything as long as it matches uniquely).

```text
$ tree testing/cypress/integration

testing/cypress/integration/
├── 01_app_spec.js
├── 01_micro_spec.js
├── 02_app_spec.js
├── 02_micro_spec.js
├── 03_app_spec.js
├── 03_micro_spec.js
```

2. You need to consider how and when you reset Micro. We chose to use a Before [hook][cypress-hooks] in the start of every `xx_app_spec.js` file, since the naming strategy ensures that the tests will run in `app`-`micro` pairs.
3. If you just want to run only a particular app test file (and not all of them), you will also need its corresponding Micro test file. Since this is a usual case, for example, when a particular spec file fails, we added another npm script `cy-micro:pair-run`, which will match a naming pattern and run the corresponding micro-spec file after the matching app spec. The script can be seen in [package.json](./package.json).

Example usage:

- To run all spec files in your `cypress/integration` directory (in alphabetical order)

```bash
npm run cypress:run
```

- To run an app-micro pair of spec files given a name pattern

```bash
PAIR_PATTERN=03 npm run cy-micro:pair-run  # will run first the 03_app_spec.js and then the 03_micro_spec.js
```

Just make sure that this name pattern is unique for this pair.

This kind of organization also has the benefit, that you can keep having the tests you normally had for your app (just adding the before-hook to reset Micro), and just add a corresponding micro-spec file, to test the events emitted from the original run of that app test. That way, you can test your app's features in the `app_spec` files and your tracking implementation in the corresponding `micro_spec` files.

#### 4.2.3 Commands

Since Cypress allows to define your own [custom commands][cypress-custom], in this repo you can find commands specifically for use with Snowplow Micro and assertions of events. You can see them all in [commands.js](./testing/cypress/support/commands.js).

#### cy.noBadEvents

*Example call*:

```javascript
    cy.noBadEvents();
```

Even if this is the only thing that you check in your tests, you are already brilliant. It is going to ensure that your app is not sending any bad events, in other words you ensure that all your events end up in your warehouse. There are no more gaps in your data or in your analytics and no recovery jobs to get those bad events back, jobs that are not going to be trivial, especially if you are dealing with high volume of events.

#### cy.numGoodEvents

*Example call*:

```javascript
cy.numGoodEvents( 19 );
```

This command ensures that all the events you want to track, actually get tracked. Because there may be not bad events, but maybe your tracker is not implemented correctly into the app's logic.

#### cy.eventsWithEventType

*Example call*:

```javascript
    cy.eventsWithEventType( "page_view", 8 );
    cy.eventsWithEventType( "struct", 45 );
```

This command is useful when you want to ensure that a particular type of events got tracked as many times as it should.

#### cy.eventsWithParams

*Example call*:

```javascript
    cy.eventsWithParams(
        {
            "event": "struct",
            "se_category": "Media",
            "se_action": "Play video",
            "se_label": "Surfing"
        }, 3 );
```

This command accepts as first argument an object with the expected event's field-value pairs. You can read about all the fields in Snowplow docs [here][canonical-event]. This command is particularly useful when asserting on [structured events][structured-event-tracking].

#### cy.eventsWithSchema

*Example call*:

```javascript
    cy.eventsWithSchema( "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0", 5 );
```

 With this command you can look specifically for [unstructured events][tracking-design], which include both custom unstructured events and all other default Snowplow events that are of "unstruct" eventType (link-click, submit-form, ad-impression etc.)

#### cy.eventsWithContexts

*Example call*:

```javascript
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

With this command you can check whether the predefined(e.g. webpage, geolocation) or [custom][custom-context] contexts/entities got properly attached to events. You can not only check by the schema of the entities but also by their data. Note that the first argument to this command should be an array of objects, like the contexts' array that can be attached to any Snowplow event. The keys of these objects can be either "schema" or "data". For "schema" the value should be a string (the schema). For "data" the value should be an object of key-value pairs, depending on the context.

#### cy.eventsWithProperties

*Example call*:

```javascript
    cy.eventsWithProperties({

            "parameters": {
                "event": "unstruct",
                "v_tracker": "js-3.1.3"
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

This is a command that combines some of the above (eventsWithSchema, eventsWithParams, eventsWithContexts), and also adds the ability to look into the data of unstructured events.
The object that gets passed as the first argument, can have as keys:

- "schema" : matches by schema
- "values" : matches by the data of an unstructured event
- "contexts" : matches by contexts
- "parameters" matches by the event's fields

It will return the events that have all those properties.
As shown in the examples above, you do not have to use all the properties, and the command works accordingly.

#### cy.eventsWithOrder

*Example call*:

```javascript
    cy.eventsWithOrder([
        {
            "schema": "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0",
            "values": {"elementId": "user_email"}
        },
        {
            "schema": "iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0",
            "values": {"elementId": "user_email"}
        },
        {
            "schema": "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0"
        }
    ]);
```

With this command you can assert that events happened in a specified (ascending) order. For example, in the call above, we can assert that the focus\_form event happened before the corresponding change\_form event, which in turn happened before the submit\_form event. The argument to this command is an array of at least 2 event "descriptions", which are exactly like the properties' object argument of `eventsWithProperties`. Those event descriptions need to uniquely identify exactly one Snowplow event.
Internally, this command compares events' `derived_tstamp`.

#### 4.2.4 Some further notes

```text
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
    - In the `commands.js` file, the commands are defined based on the `Micro` [helper module](./testing/jsm/helpers.js)
    - The `integration/helpers_spec.js` [file](./testing/cypress/integration/helpers_spec.js) tests the helper functions that define the matching logic. For a different custom matching logic, you can tweak the helper functions, and then test them.

2. Environment variables.
    - Cypress allows for [many ways][cypress-env] to set environment variables. In this example we set them in the `plugins/index.js` [file](./testing/cypress/plugins/index.js).

## 5. Additional resources

- [Snowplow Docs][snowplow-docs]
- [Designing your Tracking][tracking-design]
- Snowplow Micro's [REST API][snowplow-micro-rest]
- [Iglu][iglu] and [Iglu client configuration][iglu-resolver]
- [Self-describing JSON Schemas][blog-sdj] and [SchemaVer][blog-schemaver]
- [Beacon][beacon-method]
- From Snowplow's JavaScript tracker's documentation: [Setting the page unload pause][page-unload-pause], [POST support][post-support], [beacon API support][beacon-support].

## 6. Upgrading Micro from v0.x to v1

Snowplow Micro v1 has been released.

- Snowplow Micro now uses the exact same validation as a production Snowplow pipeline, which is even stricter and so ensures that if Micro validates an event, then it cannot fail during the enrichment in production.

- Micro now outputs the post-enrichment, canonical event (just with enrichments deactivated).

- Also, since version 1.2 Embedded Iglu capabilities are available, which we also use to resolve the custom schemas in this examples' repository. You can find out more in the "Advanced usage" section of Snowplow Micro [documentation page][snowplow-micro-docs].

If you have been using the previous version (v0.1.0) in your test suites, you can easily upgrade to the new version (recommended). The steps include:

1. Point to the new version `1.2.1` of Micro in your `docker run` command or in your `docker-compose.yml` file.

2. Modify the configuration for Micro, an example of which can be found in the `micro.conf` file [here][snowplow-micro-collector-config].

3. The [response format][snowplow-micro-good] for `GoodEvents` has changed, since Micro now outputs the post-enrichment event. This means that if in your tests you were filtering on `GoodEvents` through the `/micro/good` endpoint, you will need to change:

    - the expected values for `eventType`. For example:

    | v0   | v1          |
    |------|-------------|
    | `pv` | `page_view` |
    | `pp` | `page_ping` |
    | `se` | `struct`    |
    | `ue` | `unstruct`  |
    |      |             |

    Note: If you use the [helper module](./testing/jsm/helpers.js) of this repo and upgrade to its latest release, then the above should be the only change you will need in your tests' spec files.

    - the event specific fields, that were transformed for enrichment. Some of them are in the table below, but you can see all of the transformations [here][enrich-transform].

    | v0      | v1                    |
    |---------|-----------------------|
    | `e`     | `event`               |
    | `aid`   | `app_id`              |
    | `p`     | `platform`            |
    | `uid`   | `user_id`             |
    | `dtm`   | `dvce_created_tstamp` |
    | `tna`   | `name_tracker`        |
    | `page`  | `page_title`          |
    | `se_ca` | `se_category`         |
    | `se_ac` | `se_action`           |
    | `se_la` | `se_label`            |
    | `se_pr` | `se_property`         |
    | `se_va` | `se_value`            |
    | `ue_pr` | `unstruct_event`      |
    | `co`    | `contexts`            |
    | `ue_px` | `unstruct_event`      |
    | `cx`    | `contexts`            |

    Note: The `unstruct_event` and `contexts` fields have already parsed the `ue_pr` and `co` and have already decoded and parsed the `ue_px` and `cx` raw event fields respectively.

    - the structure you expect. The event that was the output of Micro's v0.1.0, now corresponds to the `rawEvent` field of the event output of v1.0.0.

    A partial example of a `GoodEvent` follows, showing the structure and highlight the differences described above:

      ```text
      {
          "rawEvent": {
              ...
              "parameters": {
                  "e": "ue",
                  "eid": "966d4d79-11d9-4fa6-a1a5-6a0bc2d06de1",
                  "aid": "DemoID",
                  ...,
                  "ue_pr": "{\"schema\":\"iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0\",\"data\":{\"schema\":\"iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0\",\"data\":{\"formId\":\"FORM\",\"elementId\":\"user_email\",\"nodeName\":\"INPUT\",\"elementClasses\":[\"form-control\"],\"value\":\"fake@foo.com\",\"elementType\":\"email\"}}}",
                  ...
              },
              ...
          },
          "eventType": "unstruct",
          "schema": "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0",
          "contexts": [
              "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0",
              ...
          ],
          "event": {
              "event": "unstruct",
              "event_id": "966d4d79-11d9-4fa6-a1a5-6a0bc2d06de1",
              "app_id": "DemoID",
              ...,
              "unstruct_event": {
                  "schema": "iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0",
                  "data": {
                      "schema": "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0",
                      "data": {
                          "formId": "FORM",
                          "elementId": "user_email",
                          "nodeName": "INPUT",
                          "elementClasses": [
                              "form-control"
                          ],
                          "value": "fake@foo.com",
                          "elementType": "email"
                      }
                  }
              },
              ...
          }
      }
      ```

[gh-actions]: https://github.com/snowplow-incubator/snowplow-micro-examples/actions
[gh-actions-image]: https://github.com/snowplow-incubator/snowplow-micro-examples/workflows/testing%20with%20Snowplow%20Micro/badge.svg
[license]: https://www.apache.org/licenses/LICENSE-2.0
[license-image]: https://img.shields.io/badge/license-Apache--2-blue.svg?style=flat

[snowplow]: https://snowplowanalytics.com
[snowplow-docs]: https://docs.snowplowanalytics.com/
[snowplow-tracker-protocol]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/snowplow-tracker-protocol
[snowplow-trackers]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/
[canonical-event]: https://docs.snowplowanalytics.com/docs/understanding-your-pipeline/canonical-event/
[tracking-design]: https://docs.snowplowanalytics.com/docs/understanding-tracking-design/understanding-schemas-and-validation
[blog-sdj]: https://snowplowanalytics.com/blog/2014/05/15/introducing-self-describing-jsons/
[blog-schemaver]: https://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/

[javascript-tracker]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/
[pageview-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Page_Views
[activity-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Activity_Tracking_page_pings
[form-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Form_tracking
[link-click-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Link_click_tracking
[self-describing-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Tracking_custom_self-describing_events
[structured-event-tracking]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Tracking_custom_structured_events
[custom-context]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracking-events/#Custom_context
[webpage-context]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracker-setup/initialization-options/#webPage_context
[post-support]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracker-setup/initialization-options/#POST_support
[beacon-support]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracker-setup/initialization-options/#Beacon_API_support
[page-unload-pause]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/tracker-setup/initialization-options/#Setting_the_page_unload_pause

[unload-event]: https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event
[beacon-method]: https://w3c.github.io/beacon/#sendbeacon-method

[snowplow-micro]: https://github.com/snowplow-incubator/snowplow-micro
[snowplow-micro-docs]: https://docs.snowplowanalytics.com/docs/managing-data-quality/testing-and-qa-workflows/set-up-automated-testing-with-snowplow-micro/#Snowplow_Micro
[snowplow-micro-rest]: https://docs.snowplowanalytics.com/docs/managing-data-quality/testing-and-qa-workflows/set-up-automated-testing-with-snowplow-micro/#REST_API
[snowplow-micro-collector-config]: https://github.com/snowplow-incubator/snowplow-micro/blob/master/example/micro.conf
[snowplow-micro-good]: https://docs.snowplowanalytics.com/docs/managing-data-quality/testing-and-qa-workflows/set-up-automated-testing-with-snowplow-micro/#32_microgood_good_events
[snowplow-micro-release-post]: https://snowplowanalytics.com/blog/2020/09/11/snowplow-micro-1-0-0-released/
[enrich-transform]: https://github.com/snowplow/enrich/blob/master/modules/common/src/main/scala/com.snowplowanalytics.snowplow.enrich/common/enrichments/Transform.scala

[iglu]: https://github.com/snowplow/iglu
[iglu-resolver]: https://docs.snowplowanalytics.com/docs/pipeline-components-and-applications/iglu/iglu-resolver

[nightwatch]: https://nightwatchjs.org/
[nightwatch-test-hooks]: https://github.com/nightwatchjs/nightwatch-docs/blob/643e9a63a94deba6bd84bf2dd78cb27693620e20/guide/using-nightwatch/using-test-hooks.md

[cypress]: https://www.cypress.io
[cypress-repo]: https://github.com/cypress-io/cypress
[cypress-docs]: https://docs.cypress.io/
[cypress-best-external]: https://docs.cypress.io/guides/references/best-practices.html#Visiting-external-sites
[cypress-best-tests]: https://docs.cypress.io/guides/references/best-practices.html#Having-tests-rely-on-the-state-of-previous-tests
[cypress-custom]: https://docs.cypress.io/api/cypress-api/custom-commands.html
[cypress-request]: https://docs.cypress.io/api/commands/request.html
[cypress-issue]: https://github.com/cypress-io/cypress/issues/686
[cypress-hooks]: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Hooks
[cypress-env]: https://docs.cypress.io/guides/guides/environment-variables.html
