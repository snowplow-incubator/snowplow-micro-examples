# snowplow-micro-examples
Examples of how to apply Snowplow Micro to popular build/test strategies


## Local setup

To follow the steps below, you will need to have installed:

 - Docker
 - Npm
 - Python 3 and pip

Assuming that on a Linux machine your homedir is `/home/user` (adjust accordingly):

#### 1. Clone this repository and start Snowplow Micro

```
$ pwd
/home/user

$ git clone https://github.com/snowplow-incubator/snowplow-micro-examples.git

$ cd snowplow-micro-examples

$ docker-compose up

```

Now, [Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro) runs on port 9090


#### 2. Install dependencies and start serving the app

```
$ pwd
/home/user/snowplow-micro-examples

$ pip3 install -r app/requirements.txt

$ npm install

$ python3 app/manage.py runserver 8000

```
You can now visit the app on http://localhost:8000 . You can then see the events being tracked from the app on [Micro's API endpoints](https://github.com/snowplow-incubator/snowplow-micro#3-rest-api).

To make running micro easier we set up a docker compose file. Docker compose is a way to script down into configurations; when you have a git repo with a lot of code in it, the docker compose file launches docker customised to your repo:
[Docker Compose Example](https://github.com/snowplow/iglu/blob/release/0.6.0/2-repositories/iglu-server/docker/docker-compose.yml)

##Tests Ran

The purpose of this repo is to show that micro is operating in the way we would expect for a given application - showing no bad events, sending the correct events in the correct format, and retriving the correct data for every tracker.
This repo therefore shows you how to set up trackers, how to make customised (unstructured) events, and structured events, as well as adding in tests in both nightwatch and cypress to demonstate the capabilities of micro.
#### The tests implemented in this repo are:
1) No bad events
2) Number of good events = number of expected good events
3) Ensuring that total number of events is right - expected number of good events + bad events (noBadEvents = True)
4) Checking proper values of structured and unstructured events are sent to micro
5) Test which shows that tracker is successfully sent to micro, and successfully received - used by checking name of event is sent to micro
6) Event With Property test - context, event type and schema 
	- user puts in an event and we match by all 3 conditions (contexts, properties and schema - this determines whether or not the fake test event is equal to the one on micro - for both structured and unstructured)
7) Race condition test - to ensure that event x is always sent to micro before event y (in our case we wanted to ensure cart action occurred before purchase)

##Setting up Nightwatch
Powered by Node.js, Nightwatch.js is an open-source automated testing framework that aims at providing complete E2E (end to end) solutions to automate testing with Selenium Javascript for web-based applications, browser applications, and websites. 

This framework relies on Selenium and provides several commands and assertions within the framework to perform operations on the DOM elements.

#### How does Nightwatch JS work?
Nightwatch communicates over a restful API protocol that is defined by the W3C WebDriver API. It needs a restful HTTP API with a Selenium JavaScript WebDriver server.
In order to perform any operation i.e. either a command or assertion, Nightwatch usually requires sending a minimum of two requests. 

It works as follows:

- The first request locates the required element with the given XPath expression or CSS selector.
- The second request takes the element and performs the actual operation of command or assertion.

#### Getting Started
```
$ git init
$ npm init -y 
$ npm install nightwatch --save-dev 
$ npm install chromedriver --save-dev 
```
1. Create default json package
2. Create node modules folder and add nightwatch to dev dependencies
3. Add nightwatch.conf.js file (must contain basic configuration file)
4. Add a chrome driver binary for nightwatch configs - adds it into node modules - allows us to send commands to the chrome driver

Running nightwatch:
```
npm test
```
