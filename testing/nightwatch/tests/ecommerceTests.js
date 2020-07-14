module.exports = {
    beforeEach : function(browser) {
        browser
            .resetMini();
      },


    'Number of good events after ADDTOBASKET is equal to two' : function(browser) {
        browser
            .url('http://127.0.0.1:8000/index');

         const quantityClass = '.cart-quantity-input';
         const buttonClass ='.shop-item-button';

        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

         browser.waitForElementVisible(buttonClass)
         .click(buttonClass, function (result) {
         this.assert.equal(true, result.status == 0, "Button clicked successfully");
         });

        browser.assert.noOfGoodEvents(2);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(2);

    },

    'Number of good events after REMOVEFROMBASKET is equal to three' : function(browser) {
        browser
            .url('http://127.0.0.1:8000/index');

        const quantityClass = '.cart-quantity-input';
        const buttonClass_add ='.shop-item-button';

        const buttonClass_remove ='.btn-danger';
        browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="2"]');

         browser.waitForElementVisible(buttonClass_add)
                 .click(buttonClass_add, function (result) {
                 this.assert.equal(true, result.status == 0, "Button clicked successfully");
                 });

        browser.waitForElementVisible(buttonClass_remove).element('css selector', buttonClass_remove, (result) => {
          browser.execute("arguments[0].click()",[result.value]);
        });



        browser.assert.noOfGoodEvents(3);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(3);

    },

     'Number of good events after SELECTION is equal to one' : function(browser) {
            browser
                .url('http://127.0.0.1:8000/index');

              const quantityClass = '.cart-quantity-input';
            browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value="1"]');

            browser.assert.noOfGoodEvents(1);
            browser.assert.noBadEvents();
            browser.assert.noOfTotalEvents(1);
        }
};
