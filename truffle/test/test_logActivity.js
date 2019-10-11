const ActivityLogger = artifacts.require('./ActivityLogger.sol');
let activityLogger;

contract('ActivityLogger.logActivity()', (accounts) => {
  before(() => {
    id = '112233445566';  // Or any other string
    multiHash = 'QmYtUc4iTCbbfVSDNKvtQqrfyezPPnFvE33wFmutw9PBBk';
    metadata  = 'other metadata about the profile'
    params = [ id, multiHash, metadata ];
  });

  beforeEach(async () => {
    activityLogger = await ActivityLogger.new();
  });

  describe('When logging an event on-chain...', () => {
    it('should return true on the call check', async () => {
      const callRes = await activityLogger.logActivity.call(...params);
      assert(callRes, 'Call response incorect');
    });

    it('should emit the LogActivity event with the correct params', async () => {
      const res = await activityLogger.logActivity(...params);
      
      const loggedEvent = res.logs[0];
      const timestamp = loggedEvent.args.timestamp.toNumber();

      assert.strictEqual(res.logs.length, 1, 'Incorrect amount of events emitted');
      assert.strictEqual(loggedEvent.event, 'LogActivity', 'Event not emitted');
      assert.strictEqual(loggedEvent.args.id, id, 'id incorrect');
      assert.strictEqual(loggedEvent.args.multiHash, multiHash, 'multihash incorrect');
      assert.isAbove(timestamp, 0, 'timestamp incorrect');
    });
  });
});
