/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config

    // modify default config values
    config.baseUrl = 'http://localhost:8000';

    // Env vars for Micro
    config.env.SNOWPLOW_MICRO_URI = 'http://localhost:9090/';
    config.env.MICRO_ALL = 'micro/all';
    config.env.MICRO_GOOD = 'micro/good';
    config.env.MICRO_BAD = 'micro/bad';
    config.env.MICRO_RESET = 'micro/reset';

    // return config object
    return config;
};