context( 'testing events from 03_app_spec.js', () => {

    // noBadEvents
    it( 'asserts no bad events', () => {

        cy.noBadEvents();

    });


    // assertions with contexts
    it( 'asserting contexts reflecting quantity changes using eventsWithProperties', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";
        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        // assert contexts using eventsWithProperties
        cy.eventsWithProperties({
            "contexts": [
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh123",
                        "name": "One-size summer hat",
                        "price": 15.5,
                        "quantity": 2
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh456",
                        "price": 24.49,
                        "quantity": 2
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "bb123",
                        "quantity": 1
                    }
                },
                {
                    "schema": webPageContextSchema
                }
            ]
        }, 1 ); //only the purchase event

    });


    it( 'asserting contexts reflecting quantity changes using eventsWithContexts', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";
        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        // - checking quantity
        cy.eventsWithContexts(
            [
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh123",
                        "name": "One-size summer hat",
                        "price": 15.5,
                        "quantity": 3
                    }
                }
            ], 1 );  // only the cart_event has quantity:3 for this product

        // - checking that event with wrong quantity in one entity does not exist
        cy.eventsWithContexts(
            [
                {
                    "schema": productEntitySchema,
                    "data": {
                        "name": "One-size summer hat",
                        "quantity": 2     // correct
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "bb123",
                        "quantity": 2     // correct
                    }
                }
            ], 0 );

    });

});
