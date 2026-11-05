# Integrated browser acceptance v0.1

Open https://erikehresman-st1987.github.io/story-engine-test-lab/ after the latest successful deployment.

The Increment 9 section uses an isolated save key, story-lab-acceptance-v1. It does not change Little Field Farm. All dialogue is test-only.

1. Reset only Increment 9.
2. Accept Garden and Dinner.
3. Harvest two carrots in Garden; verify shared count is two.
4. Deliver in Dinner; verify shared count becomes zero.
5. Attempt delivery in Garden; verify it cannot complete without more carrots.
6. Refresh Safari; verify inventory and both invitation states persist.
7. Harvest two more carrots in Garden, deliver, advance to chapter 2, and refresh.
8. Restore previous save; verify earlier state is loaded. Make a change to persist recovered state.
9. Test offline reload if the page has been installed and cached.

Report device, iOS version, step numbers passed or failed, error messages, and offline behavior.

Recovery is not automatic. A backup loaded into memory is not persisted until the next action. Node test success does not establish browser acceptance.
