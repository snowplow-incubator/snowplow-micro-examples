module.exports = {
    beforeEach : function(browser) {
        browser
          .resetMini()
      },


    'Number of good events after ADDTOBASKET is equal to two' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Button loaded successfully')
            .click(imgClass, function (result) {
                this.assert.equal(true, result.status == 0, "Button clicked successfully");
            })

        browser.assert.noOfGoodEvents(3);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(3);
        browser.assert.trackerSuccess(["Selection", "AddToBasket"]);


    },

    'Number of good events after SELECTION is equal to one' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgGrid = "#image-grid";
        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Selection loaded successfully')
            .moveToElement(imgClass,10,10);
        browser.moveToElement(imgGrid,400,400);

        browser.assert.noOfGoodEvents(2);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(2);
        browser.assert.trackerSuccess(["Selection", "AddToBasket"]);


    },

    'Check proper values are sent for the SELECTION event': function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgGrid = "#image-grid";
        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Image loaded successfully')
            .click(imgClass);

        browser.assert.trackerSuccess(["Selection"]);
        browser.assert.successfulEvent({
                "eventType":"se",
                "parameters":{
                    "se_ca" : "Faces",
                    "se_ac" : "Click",
                    "se_pr" : 0,
                    "se_va": "125,125"
                },
                "contexts":[{
                               schema: 'iglu:com.emily.test/user_context/jsonschema/1-0-0',
                                    data: {
                                        id: 1234,
                                        age: 25
                                        }

                                      }]
                })

    },

    'Check proper values are sent for the ADD TO BASKET event': function(browser) {

        browser
            .url('http://127.0.0.1:8001/');

        const imgGrid = "#image-grid";
        const imgClass = '.floated_img[type="image"]';
        click_coords = (10,10)

         browser.waitForElementVisible(imgClass, 'Image loaded successfully')
            .moveToElement(imgClass,10,10);
        browser.moveToElement(imgGrid,400,400);

        browser.assert.successfulEvent({
        "eventType":"se",
        "parameters":{
            "se_ca" : "Faces",
            "se_ac" : "Hover",
            "se_pr" : 0,
            "se_va": 0
        },
        "contexts":[{
                   schema: 'iglu:com.emily.test/user_context/jsonschema/1-0-0',
                        data: {
                            id: 1234,
                            age: 25
                            }

                              }]
        })
        browser.assert.trackerSuccess(["AddTOBasket"]);

        }
