module.exports = {
    "src_folders": ["nightwatch/tests"],

    "webdriver": {
        "start_process": true,
        "server_path": "../node_modules/.bin/chromedriver",
        "port": 9515
    },

    "test_settings": {
        "default": {
            "screenshots": {
                "enabled": true,
                "on_failure": true,
                "on_error": true,
                "path": "tests_output/screenshots"
            },
            "custom_assertions_path": "nightwatch/assertions",
            "custom_commands_path": "nightwatch/commands",
            "desiredCapabilities": {
                "browserName": "chrome",
                'chromeOptions': {
                    'args': ['--headless']
                }
            }
        }
    }
};