module.exports = {
    beforeEach: function(browser) {
        browser
            .resetMini();
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
            "eventType": "ue",
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
               }
            ]
        });

    },

    'Number of good events after REMOVEFROMBASKET is equal to three': function(browser) {
        browser
            .url('http://127.0.0.1:8000/shop');

        const quantityClass = '.cart-quantity-input';
        const buttonClass_add = '.shop-item-button';

        const buttonClass_remove = '.btn-danger';
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
            "eventType": "ue",
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
        const purchaseClass = ".btn-purchase"

        browser.waitForElementVisible(purchaseClass).element('css selector', purchaseClass, (result) => {
            browser.execute("arguments[0].click()", [result.value]);
        });

        const events_list = [{
                       "eventType": "ue",
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
                          }
                       ]
                   },
            {
            "eventType": "ue",
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
               }
            ]
        }
        ]
        browser.assert.orderOfEvents(events_list);
    }
};
