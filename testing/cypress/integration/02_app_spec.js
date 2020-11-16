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


describe('scenario involving cart removals', () => {

    before(() => {

        cy.resetMicro();

    });

    it('user logins, adds to cart, removes from cart, completes purchase', () => {

        // EVENTS: +1: (1 * page_view)
        // - pageView of start.html
        cy.visit(""); // baseUrl

        // EVENTS: +4: (3 * unstruct + 1 * page_view)
        // - 1.focus_form for email
        // - 2.change_form for email
        // - 3.submit_form
        // - 4.pageView for index.html
        cy.get('[test-id=email-input]')
            .type('fake@email.com');

        cy.get('[test-id=password-input]')
            .type('fake0password');

        cy.get('[test-id=submit-button]')
            .click();

        // EVENTS: +5: (5 * unstruct)
        // - 3 buttons * cart_action_event (add to cart)
        // - 2 buttons * cart_action_event (remove from cart)
        cy.get('[test-id=add-btn-1]').click({});
        cy.get('[test-id=rem-btn-1]').click({});

        cy.get('[test-id=add-btn-2]').click({});
        cy.get('[test-id=rem-btn-2]').click({});

        cy.get('[test-id=add-btn-3]').click({});

        // EVENTS: +2: (1 * unstruct + 1 * page_view)
        // - 1.purchase_event
        // - 2.pageview of thanks.html
        cy.get('.btn-purchase').click();

    });

});
