const Magazine = require('./magazine');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Magazine', () => {
    let magazine;

    before(() => {
        magazine = new Magazine({
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
    });

    afterEach(() => {
        magazine.stopSync();
    });

    describe('#startSync()', () => {
        it('should start syncing events', async () => {
            const promise = new Promise((resolve, reject) => {
                magazine.on("MyEvent", (event) => {
                    resolve();
                });
            });
            magazine.startSync();
            await expect(promise).to.be.fulfilled;
        });
    });

    describe('#stopSync()', () => {
        it('should stop syncing events', async () => {
            const promise = new Promise((resolve, reject) => {
                magazine.on("MyEvent", (event) => {
                    reject(new Error('Event received after sync stopped'));
                });
            });
            magazine.startSync();
            magazine.stopSync();
            await expect(promise).to.not.be.rejected;
        });
    });

    describe('#publish()', () => {
        it('should publish the magazine', async () => {
            const magazineId = await magazine.publish({
                alias: "my-magazine",
                url: "https://my-magazine.herokuapp.com/gun",
            });
            expect(magazineId).to.be.a('string');
        });
    });

    describe('#subscribe()', () => {
        it('should subscribe to the magazine', async () => {
            const magazineId = await magazine.publish({
                alias: "my-magazine",
                url: "https://my-magazine.herokuapp.com/gun",
            });
            const magazine2 = await Magazine.subscribe(magazineId, {
                gun: {
                    peers: ["https://my-magazine.herokuapp.com/gun"],
                },
                provider: "http://localhost:8545",
            });
            expect(magazine2).to.be.an.instanceof(Magazine);
        });
    });
});
