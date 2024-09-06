# ExtraUI

> added a readme cos i was tired of seeing the boilerplate text grr!!

Supplementary interface for [ComfyUI](https://github.com/comfyanonymous/ComfyUI). **(wip!)**

The goal is _not_ to recreate the full functionality of comfy, but rather take **complete workflows** and make it easier to iterate with new values. Additionally, for more complex workflows it allows **re-using outputs** in sequential runs without reloading the entire workspace. No more "Mega Workflows" with hundreds of steps, just take the best parts of each workflow and combine them here!

---

| See it in action... (also wip) |
| :-----------------: |
| ![example](https://github.com/user-attachments/assets/fc086311-b5f0-4bcd-94bc-296a771f2482) |

## Highlights

- [x] Actually usable on mobile
- [ ] Workflow versioning based on outputs
- [ ] Shared inputs (eg. denoise, steps, prompts) across workflows
- [ ] Reroute outputs from one workflow as input
  - eg. use text2img result as the input for img2img
- Native functionality:
  - [ ] XY plot
  - [ ] Seed increment
  - [ ] Easier concat conditioning (BREAK functionality from a1111)

## Contributing

I appreciate ur interest but ATM of this commit, the code is so ugly i want a better dx for u ;_; will update the README once it's ready for more contributors. Rough checklist before start accepting PRs:
- [ ] Finish multi-workflow runner
- [ ] Finish outputs manager
- [ ] Final code cleanup
- [ ] Add styleguide (i hate bikeshedding!)

If you have additional feature ideas feel free to create an issue and we can discuss there!
