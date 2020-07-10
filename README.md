# snowplow-micro-examples
Examples of how to apply Snowplow Micro to popular build/test strategies


## Local setup

To follow the steps below, you will need to have installed:

 - Npm
 - Python 3 and pip

Assuming that on a Linux machine your homedir is `/home/user` (adjust accordingly):

#### 1. Install and run Snowplow Micro

```
$ pwd
/home/user

$ git clone https://github.com/snowplow-incubator/snowplow-micro.git

$ cd snowplow-micro

$ docker run --mount type=bind,source=$(pwd)/example,destination=/config -p 9090:9090 snowplow/snowplow-micro:latest --collector-config /config/micro.conf --iglu /config/iglu.json

```

Now, [Snowplow Micro](https://github.com/snowplow-incubator/snowplow-micro) runs on port 9090


#### 2. Clone this repository and install dependencies

```
$ pwd
/home/user

$ git clone https://github.com/snowplow-incubator/snowplow-micro-examples.git

$ cd snowplow-micro-examples

$ pip3 install -r requirements.txt

$ npm install

```

#### 3. Start serving the app

```
$ pwd
/home/user/snowplow-micro-examples

$ python3 manage.py runserver 8000

```
You can now visit the app on http://localhost:8000 . You can then see the events being tracked from the app on [Micro's API endpoints](https://github.com/snowplow-incubator/snowplow-micro#3-rest-api).
