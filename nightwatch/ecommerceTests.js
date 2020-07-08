module.exports = {
    beforeEach : function(browser) {
        browser
          .resetMini()
      },

    'Number of good events after CLICK is equal to two' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Image loaded successfully')
            .click(imgClass, function (result) {
                this.assert.equal(true, result.status == 0, "Image clicked successfully");
            })

        browser.assert.noOfGoodEvents(3);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(3);
        browser.assert.trackerSuccess(["Click", "Hover"]);


    },

    'Number of good events after HOVER is equal to one' : function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgGrid = "#image-grid";
        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Image loaded successfully')
            .moveToElement(imgClass,10,10);
        browser.moveToElement(imgGrid,400,400);

        browser.assert.noOfGoodEvents(2);
        browser.assert.noBadEvents();
        browser.assert.noOfTotalEvents(2);
        browser.assert.trackerSuccess(["Hover"]);


    },

    'Check proper values are sent for the CLICK event': function(browser) {
        browser
            .url('http://127.0.0.1:8001/');

        const imgGrid = "#image-grid";
        const imgClass = '.floated_img[type="image"]';

        browser.waitForElementVisible(imgClass, 'Image loaded successfully')
            .click(imgClass);

        browser.assert.trackerSuccess(["Click", "Hover"]);
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

    'Check proper values are sent for the HOVER event': function(browser) {

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
        browser.assert.trackerSuccess(["Hover"]);

        },


        'Check the order of events; hover always before click': function(browser) {

                browser
                    .url('http://127.0.0.1:8001/');
                const imgGrid = "#image-grid";
                const imgClass = '.floated_img[type="image"]';

                 browser.waitForElementVisible(imgClass, 'Image loaded successfully')
                    .moveToElement(imgClass,500,500);
                browser.moveToElement(imgGrid,10,10);

                browser.waitForElementVisible(imgClass, 'Image loaded successfully')
                    .click(imgClass);

                 browser.waitForElementVisible(imgClass, 'Image loaded successfully')
                    .moveToElement(imgClass,10,10);
                browser.moveToElement(imgGrid,400,400);

                events_list = [
                 {
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
                },
                {
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
                   }]
                browser.assert.orderOfEvents(events_list);
                }


};