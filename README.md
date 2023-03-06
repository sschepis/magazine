# Magazine

Magazine is a decentralized library for Ethereum event logging, built on top of gun.js and ethers.js.

With Magazine, you can store Ethereum events in a decentralized manner using gun.js, and sync them from the blockchain to the magazine using ethers.js. You can then publish the magazine to the decentralized network, and subscribe to it from other nodes on the network. You can read events from the magazine by subscribing to them using their event name.

Magazine provides a simple and easy-to-use interface for interacting with decentralized event logs on the Ethereum blockchain.

## Installation

Magazine can be installed via npm:

`npm install magazine`

## Usage

To use Magazine, you will need to create a new instance of the Magazine class and pass in the required configuration options. For example:

```javascript
const Magazine = require('magazine');

const magazine = new Magazine({
  name: "My Magazine",
  address: "0x1234567890",
  networkId: 1,
  abi: [
    "event MyEvent(address indexed from, uint256 indexed value)",
    "event MyEvent(address indexed from, uint256 indexed value)",
  ],
  provider: "http://localhost:8545",
  gun: {
    peers: ["http://localhost:8765/gun"],
  },
});
```

You can then start syncing events from the Ethereum blockchain to the magazine by calling the `startSync()` method:

```javascript
magazine.startSync();
```

You can stop syncing events by calling the `stopSync()` method:

```javascript
magazine.stopSync();
```

You can publish the magazine to the decentralized network by calling the `publish()` method:

```javascript
const magazineId = await magazine.publish({
  alias: "my-magazine",
  url: "https://my-magazine.herokuapp.com/gun",
});
```

You can then subscribe to the magazine on the decentralized network by calling the `subscribe()` method:

```
const magazine = await Magazine.subscribe(magazineId, {
  gun: {
    peers: ["https://my-magazine.herokuapp.com/gun"],
  },
  provider: "http://localhost:8545",
});
```

Finally, you can read events from the magazine by calling the `on()` method and passing in the event name and a callback function:

```js
magazine.on("MyEvent", (event) => {
  console.log(event);
});
```

## API

### Magazine(config)

Create a new instance of the Magazine class with the specified configuration options:

`name`: The name of the magazine.
`address`: The Ethereum address of the contract to monitor.
`networkId`: The ID of the Ethereum network (e.g. 1 for mainnet).
`abi`: An array of event ABI strings.
`provider`: The provider URL for the Ethereum network.
`gun`: The configuration options for the gun.js instance.

### startSync()

Start syncing events from the Ethereum blockchain to the magazine.

### stopSync()

Stop syncing events from the Ethereum blockchain to the magazine.

### publish(options)

Publish the magazine to the decentralized network.

`options.alias`: An optional alias for the magazine.
`options.url`: An optional URL for the gun.js instance hosting the magazine.

### static async subscribe(magazineId, config)

Subscribe to a magazine on the decentralized network.

`magazineId`: The ID of the magazine to subscribe to.

`config.gun`: The configuration options for the gun.js instance.
`config.provider`: The provider URL for the Ethereum network.

Returns a new instance of the Magazine class.

### on(eventName, callback)
Subscribe to events of a specific event name.

`eventName`: The name of the event to subscribe to.
`callback(event)`: The callback function to call when an event is received.

## License

Magazine is released under the MIT License.