/*
 * Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.
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


require('babel-register')();
module.exports = {
    "src_folders": ["nightwatch/tests"],

    "webdriver": {
        "start_process": true,
        "server_path": require('chromedriver').path,
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
                    'args': ['headless', "window-size=1280,1024","force-device-scale-factor=1"]
                }
            }
        }
    }
};
