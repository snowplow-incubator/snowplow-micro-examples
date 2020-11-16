/*
 * Copyright (c) 2018-2020 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */


module.exports = {
    beforeEach: function(browser) {
        browser
            .resetMicro();
    },


    'Number of good events after ADDTOBASKET is equal to two': function(browser) {
        browser
            .url('http://127.0.0.1:8000/shop');

        const quantityClass = '.cart-quantity-input';
        const buttonClass = '.shop-item-button';

        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

        browser.waitForElementVisible(buttonClass)
            .click(buttonClass, function(result) {
                this.assert.equal(true, result.status == 0, "Button clicked successfully");
            });

        browser.assert.noOfGoodEvents(2);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(2);

        browser.assert.successfulEvent({
            "eventType": "unstruct",
            "schema": "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0",
            "values": {
                "type": "add"
            },
            "contexts": [{
                "schema": "iglu:test.example.iglu/product_entity/jsonschema/1-0-0",
                "data": {
                    "sku": "hh123",
                    "name": "One-size summer hat",
                    "price": 15.5,
                    "quantity": 1
                }
            }]
        });

    },

    'Number of good events after REMOVEFROMBASKET is equal to three': function(browser) {
        browser
            .url('http://127.0.0.1:8000/shop');

        const quantityClass = '.cart-quantity-input';
        const buttonClass_add = '.shop-item-button';

        const buttonClass_remove = '.btn-remove';
        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

        browser.waitForElementVisible(buttonClass_add)
            .click(buttonClass_add, function(result) {
                this.assert.equal(true, result.status == 0, "Button clicked successfully");
            });

        browser.waitForElementVisible(buttonClass_remove).element('css selector', buttonClass_remove, (result) => {
            browser.execute("arguments[0].click()", [result.value]);
        });



        browser.assert.noOfGoodEvents(3);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(3);

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

    },

    'Number of good events after SELECTION is equal to one': function(browser) {
        browser
            .url('http://127.0.0.1:8000/shop');

        const quantityClass = '.cart-quantity-input';
        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

        browser.assert.noOfGoodEvents(1);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(1);
    },

    'Check the order of events; cart action always before purchase': function(browser) {

        browser
            .url('http://127.0.0.1:8000/shop');

        // ADD an item to the basket
        const quantityClass = '.cart-quantity-input';
        const buttonClass = '.shop-item-button';

        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

        browser.waitForElementVisible(buttonClass)
            .click(buttonClass, function(result) {
                this.assert.equal(true, result.status == 0, "Button clicked successfully");
            });
        // make a purchase
        const purchaseClass = ".btn-purchase";

        browser.waitForElementVisible(purchaseClass).element('css selector', purchaseClass, (result) => {
            browser.execute("arguments[0].click()", [result.value]);
        });

        const events_list = [{
                "eventType": "unstruct",
                "schema": "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0",
                "values": {
                    "type": "add"
                },
                "contexts": [{
                    "schema": "iglu:test.example.iglu/product_entity/jsonschema/1-0-0",
                    "data": {
                        "sku": "hh123",
                        "name": "One-size summer hat",
                        "price": 15.5,
                        "quantity": 1
                    }
                }]
            },
            {
                "eventType": "unstruct",
                "schema": "iglu:test.example.iglu/purchase_event/jsonschema/1-0-0",
                "values": {
                    "total": 15.5
                },
                "contexts": [{
                    "schema": "iglu:test.example.iglu/product_entity/jsonschema/1-0-0",
                    "data": {
                        "sku": "hh123",
                        "name": "One-size summer hat",
                        "price": 15.5,
                        "quantity": 1
                    }
                }]
            }
        ];
        browser.assert.orderOfEvents(events_list);
    },
    'Checking form ': function(browser) {

        browser
            .url('http://127.0.0.1:8000');

        // Input test email and password credentials
        const emailInput = '[test-id=email-input]';
        const pwdInput = '[test-id=password-input]';
        const buttonClass = '[test-id=submit-button]';

        browser.waitForElementVisible(emailInput).setValue(emailInput, 'fake@email.com');
        browser.waitForElementVisible(pwdInput).setValue(pwdInput, '1234');
        browser.waitForElementVisible(buttonClass)
            .click(buttonClass, function(result) {
                this.assert.equal(true, result.status == 0, "Button clicked successfully");
            });


        browser.assert.successfulEvent({
            "schema": "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0",
            "values": {
                "elements": [{
                    "name": "user_email",
                    "value": "fake@email.com"
                }]
            }

        });
        browser.assert.successfulEvent({
            "schema": "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0",
            "values": {
                "elements": [{
                    "name": "user_password"
                }]
            }
        }, 0);
    }
};
