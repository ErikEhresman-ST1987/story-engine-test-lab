const test = require('node:test');
const assert = require('node:assert/strict');
const { InvitationLab } = require('../src/invitation-lab.cjs');
test('invitation persistence', () => {
  const lab = new InvitationLab();
  assert.equal(lab.state.stories.dinner, 'hidden');
  lab.meetJuliette();
  lab.decide('garden', 'later');
  lab.decide('dinner', 'accept');
  assert.equal(lab.complete('dinner'), true);
  assert.equal(lab.complete('dinner'), false);
  const copy = new InvitationLab(lab.snapshot());
  assert.deepEqual(copy.snapshot(), lab.snapshot());
});
