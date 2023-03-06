// magazine - a decentralized library for ethereum event logging
// magazine uses gun.js to store events in a decentralized manner
// events are stored in a graph structure, where each event is a node
// ethers.js is used to interact with the ethereum blockchain
// gun.js is used to store events in a decentralized manner
// 
// Usage:
// 1. create a new magazine
// 2. sync history from the blockchain to the magazine
// 3. publish the magazine
// 4. subscribe to the magazine
// 5. read events from the magazine

// Import required libraries
const ethers = require('ethers');
const Gun = require('gun');
require('gun/lib/load.js');
require('gun/lib/open.js');

// Define Magazine class
export default class Magazine {
    constructor(config) {
        // Initialize Magazine parameters
        this.name = config.name;
        this.address = config.address;
        this.networkId = config.networkId;
        this.abi = config.abi;
        this.provider = new ethers.providers.JsonRpcProvider(config.provider);
        this.gun = Gun(config.gun);

        // Initialize Magazine events
        this.events = {};
        for (let i = 0; i < this.abi.length; i++) {
            const matches = this.abi[i].match(/^event\s+(\S+)/);
            if (matches) {
                const eventName = matches[1];
                this.events[eventName] = new ethers.utils.Interface([this.abi[i]]);
            }
        }
    }

    // Start syncing events from the blockchain to the magazine
    startSync() {
        this.stopSync();
        this.syncInterval = setInterval(() => {
            this.syncEvents();
        }, 5000);
        this.syncEvents();
    }

    // Stop syncing events from the blockchain to the magazine
    stopSync() {
        clearInterval(this.syncInterval);
    }

    // Sync events from the blockchain to the magazine
    async syncEvents() {
        const latestBlockNumber = await this.provider.getBlockNumber();
        const startBlockNumber = await this.getStartBlockNumber();
        for (let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber++) {
            const block = await this.provider.getBlock(blockNumber, true);
            for (let i = 0; i < block.transactions.length; i++) {
                const transaction = block.transactions[i];
                if (transaction.to === this.address) {
                    const receipt = await this.provider.getTransactionReceipt(transaction.hash);
                    for (let j = 0; j < receipt.logs.length; j++) {
                        const log = receipt.logs[j];
                        const eventName = this.events[log.topics[0]].abi.name;
                        const eventArgs = this.events[eventName].parseLog(log).args;
                        this.gun.get('events').get(eventName).set(eventArgs);
                    }
                }
            }
        }
        await this.setStartBlockNumber(latestBlockNumber + 1);
    }

    // Get the start block number for syncing events from the blockchain to the magazine
    async getStartBlockNumber() {
        const startBlockNumber = await this.gun.get('startBlockNumber').once();
        return startBlockNumber ? startBlockNumber : 0;
    }

    // Set the start block number for syncing events from the blockchain to the magazine
    async setStartBlockNumber(startBlockNumber) {
        await this.gun.get('startBlockNumber').put(startBlockNumber);
    }

    // Publish the magazine to the decentralized network
    async publish(options = {}) {
        const alias = options.alias ? options.alias : this.name.toLowerCase().replace(/\s/g, '-');
        const url = options.url ? options.url : `https://gunjs.herokuapp.com/gun`;

        const magazineNode = this.gun.back(-1).get(alias);
        const magazineId = await magazineNode.put({
            name: this.name,
            address: this.address,
            networkId: this.networkId,
            abi: this.abi,
        });
        await magazineNode.get('url').put(url);

        return magazineId;
    }

    // Subscribe to a magazine on the decentralized network
    static async subscribe(magazineId, config) {
        const magazineNode = Gun(config.gun).get(magazineId);
        const magazineData = await magazineNode.once();
        const magazine = new Magazine({
            name: magazineData.name,
            address: magazineData.address,
            networkId: magazineData.networkId,
            abi: magazineData.abi,
            provider: config.provider,
            gun: config.gun,
        });
        await magazine.gun.get('peers').set(magazineNode.get('url'));
        return magazine;
    }

    // Read events from the magazine
    on(eventName, callback) {
        const eventNode = this.gun.get('events').get(eventName);
        eventNode.map().on(callback);
    }
}

// Export Magazine class
module.exports = Magazine;
