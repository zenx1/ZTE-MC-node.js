# ZTE-MC-node.js

## About the project
This project is pretty much a direct rewrite of:
https://github.com/Kajkac/ZTE-MC-Home-assistant/blob/master/python_scripts/zte_tool.py

Reason why I created the project is that I needed the functionality from the project above but in node.js environment.

## Usage
Clone this repository, run npm install and then import router.js class to your project and use it as follows:

```
import Router from './router.js';

const router = new Router('192.168.8.1', 'PASSWORD');

// get router info
const info = await router.getInfo();

// get additional router info
const info2 = await router.getInfo2();

// get router version
const version = await router.getVersion();

// get sms info
const smsInfo = await router.sms.getInfo();

// get sent and received sms messages
const smsMessages = await router.sms.getMessages();

/*
* send SMS message
* returns JS object -> { result: 'success' }
*/
const sendResult = await router.sms.sendMessage('PHONENUMBER', 'message text');

/*
* delete SMS message by message id
* returns JS object -> { result: 'success' }
*/
const deleteResult = await router.sms.deleteMessage(123);

/*
* reboot the router
* returns JS object -> { result: 'success' }
*/
const rebootResult = await router.reboot();
```
