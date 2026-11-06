# The Dinner That Almost Wasn't — approved implementation contract

**Creative approval:** November 5, 2026. Three chapters, two player choices, one shared ending.

## Approved story
1. **A Simple Request:** Juliette organizes a community dinner for no special occasion. She asks the farmer for wheat for bread. Andy, Keiko, and Felix independently offer help. Once wheat arrives, Juliette notices the conflicting plans.
2. **Too Many Cooks:** Their well-meant but uncoordinated ingredient contributions cause a mix-up. Juliette doesn't want anyone to feel unappreciated. The farmer chooses **squash** for a hearty roasted vegetable dish or **rainbow chard** for a colorful dish and supplies that crop. Juliette admits she should stop trying to control every detail.
3. **Dinner Is Served:** Andy organizes seating, Keiko decorates, Felix organizes the mismatched supplies. The dinner succeeds. Juliette mentions the actual vegetable provided. Player chooses one response: **“They wanted to do something for you, too.”** or **“It sounds like everyone made the dinner special.”** Each gets a different Juliette response; both reach the same warm ending. Juliette learns that the best things are shared.

## Constraints
- Preserve the approved dialogue from the November 5 Foundry draft; don't substitute a different plot.
- Farm owns actual inventory and deliveries. Story cannot grant currency or subtract ingredients invisibly.
- Prefer a specific wheat objective followed by a chosen crop objective; avoid unrelated generic neighbor-order completion as the story objective.
- Save selected vegetable and final conversational choice with the narrative; verify each across refresh and chapter transitions.
- Test invalid choices, events before acceptance, repeated deliveries, and completion persistence.
- No new location or cooking system.
- Keep `main/scene-rebuild` live farm unchanged. Test on `story-engine-integration` and isolated `main/story-preview`.
- Sample narrative currently running in preview must be replaced only after automated tests of the approved version pass. User's test saves may be reset (farm in testing).

## Acceptance
The player can read the full approved story, deliver wheat, select and supply one of two crops, see that choice acknowledged at dinner, choose one of two closing responses, finish the story, and refresh at every stage without losing progress. Only then consider release to live farm, with explicit approval.
