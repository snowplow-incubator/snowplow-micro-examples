module.exports = {
    beforeEach : function(browser) {
        browser
          .resetMini()
      },


    'Number of good events after ADDTOBASKET is equal to two' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

          const quantityClass = '.cart-quantity-input';
             const buttonClass ='.shop-item-button'
             browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value=1]');

             browser.waitForElementVisible(buttonClass)
             .click(buttonClass, function (result) {
             this.assert.equal(true, result.status == 0, "Button clicked successfully");
             })

        browser.assert.noOfGoodEvents(2);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(2);
        browser.assert.trackerSuccess(["AddToBasket"]);


    },

    'Number of good events after REMOVEFROMBASKET is equal to one' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');
              const quantityClass = '.cart-quantity-input';
                 const buttonClass ='.btn-danger'
                 browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value=1]');

                 browser.waitForElementVisible(buttonClass)
                 .click(buttonClass, function (result) {
                 this.assert.equal(true, result.status == 0, "Button clicked successfully");
                 })


        browser.assert.noOfGoodEvents(1);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(1);
        browser.assert.trackerSuccess(["RemoveFromBasket"]);


    },

     'Number of good events after SELECTION is equal to two' : function(browser) {
            browser
                .url('http://127.0.0.1:8001/');

              const quantityClass = '.cart-quantity-input';
                 browser.waitForElementVisible(quantityClass).click('.cart-quantity-input option[value=1]');

            browser.assert.noOfGoodEvents(2);
            browser.assert.noBadEvents();
            browser.assert.noOfTotalEvents(2);
            browser.assert.trackerSuccess(["Selection"]);
        }