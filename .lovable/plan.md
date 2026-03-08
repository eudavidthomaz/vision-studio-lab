

# Add "Ativar Som" Button to Hero Video

## What Changes

### `src/components/HeroScrollVideo.tsx`
- Add `isMuted` state (default `true`)
- When `isMuted` changes, rebuild the iframe `src` with `mute=0` or `mute=1` — this is required because YouTube iframe API doesn't allow unmuting without the JS API, so we swap the URL
- Add a floating volume button (bottom-right of the media box) using `lucide-react` icons (`Volume2` / `VolumeX`)
- The button click is the user gesture that satisfies browser autoplay policy
- Button uses `pointer-events-auto` to be clickable even though the iframe overlay blocks interaction
- Style: small rounded pill with glass effect, visible once `scrollProgress > 0.3`

### Flow
```text
Video starts muted (autoplay works) →
User sees 🔇 button on media box →
Clicks → iframe reloads with mute=0 →
Audio plays (user gesture satisfied)
```

### Implementation Detail
- The iframe `src` is derived from `mediaSrc` + `mute=${isMuted ? 1 : 0}`
- On unmute, also add `&start=1` to avoid restarting from 0 (YouTube limitation — approximate)
- Button positioned `absolute bottom-4 right-4` inside the media box, `z-20`

