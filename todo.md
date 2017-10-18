TODO:
---

- `construct most comfortable and ergonomic view in your opinion to an supervisor`
    - add 3d transformed side players to simulate 3d camera view (?)

- readonly at first, it should display:
    - total videos length
    - preloaded length
    - current video played length
    - maybe video files/parts could be displayed also

- use meta/timestamps or not? same video names?
    - `Each line in .meta file is a timestamp of a corresponding frame in a video with the same base name.`

---
basic mockup:
---
![basic mockup](mock.png)


DONE:
---

- ability to play different videos
- increase server stability (no shutdowns on page reload)
- `change framerate` from 4 fps and so...
    - framerate component (youtube-like dropdown)
    - control framerate on client/player
- add play/pause controls
- add playback nav component (youtube like)
    - at first we could skip current 'file' part and go next/prev (+/- 200 frames approx.)
    - then we can rewind totally to the start (replay video)
    - rewind to specific frame/pos on video progress component