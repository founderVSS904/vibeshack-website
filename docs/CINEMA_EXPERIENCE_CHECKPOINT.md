# VibeShack Cinema Experience: Production Checkpoint and Handoff

Checkpoint date: 2026-07-17  
Owner: Tay / Emmanuel  
Status: v012 Blender composition/lighting preview complete; owner approval, full-motion render, and real-website integration pending
Primary local review URL: `http://localhost:3011/our-work/`

## 1. Purpose of this document

This is the authoritative handoff for the VibeShack Studios **Our Work Cinema Experience**. It is written so that Fable 5, another GPT agent, a Blender artist, or a web engineer can continue without repeating the experiments that led to this checkpoint.

This document records:

- the product vision;
- the real website and Blender workspaces;
- the theater build history;
- the Apple Vision Pro research and what it actually teaches us;
- what succeeded and what failed;
- why the Blender-integrated v008 proof looked correct;
- why the current hosted prototype looks composited;
- the approved launch architecture;
- the future scalable architecture;
- the exact workflow for Blender, video mastering, and website integration;
- operating rules, risks, open decisions, and acceptance criteria.

When an older note conflicts with this document, use this document.

## 2. Executive decision

The launch experience will use a **curated set of Blender-integrated theater films**.

For each selected portfolio film:

1. The source film is placed on the physical screen mesh inside Blender.
2. The film drives colored light and reflection behavior inside the theater.
3. Blender renders the screen, room, seats, stage, walls, lighting, camera, exposure, and color treatment together.
4. The resulting full-theater video is encoded for the website.
5. The website switches between these complete theater videos using a seamless state transition.

This is the same fundamental architecture proven by `theater_v008_integrated_animation.mp4`, upgraded to production quality.

The following launch approach is rejected:

- a static Blender theater image with a separate HTML video rectangle placed over the screen;
- CSS gradients, masks, or blurred duplicate video layers pretending to be physical light transport;
- a raw GLB export that discards the finished Blender lighting and materials.

A high-quality real-time 3D version remains a future scalability project. It is not the launch dependency.

## 3. Source-of-truth locations

### 3.1 Real VibeShack website

This is the application that must receive the production cinema experience:

```text
/Users/emmanueltay/Developer/vibeshack-website-reconcile
```

Current checkpoint facts:

- Framework: Next.js 15 App Router
- Current working branch: `codex/dynamic-frame-home-prototype`
- Checkpoint HEAD when this document was written: `a6aa13dd`
- Local server command: `npm run dev -- -p 3011`
- Owner review URL: `http://localhost:3011/our-work/`
- Production domain: `https://www.vibeshackstudios.com`
- Production deployment: not authorized by this checkpoint

Read these files before changing the real website:

```text
AGENTS.md
CLAUDE.md
app/our-work/page.tsx
components/our-work/OurWorkShowreel.tsx
lib/seo/workProjects.ts
app/our-work/[slug]/page.tsx
```

The existing `/our-work/` page is still the conventional showreel hero plus project grid. The cinema experience has not been integrated into this repository yet.

### 3.2 Blender and concept workspace

The 3D production workspace is:

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience
```

This folder contains Blender scenes, deterministic builder scripts, internal seat assets, licensed textures, render proofs, Apple research, and the temporary web prototype.

The root workspace is not a Git repository. Its `web/` subfolder is a separate Git repository.

### 3.3 Temporary hosted prototype

The following site is an experiment, not the production target:

```text
https://vibeshack-cinema.mighty-courier.chatgpt.site/?v=4
```

Its source is:

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/web
```

Checkpoint HEAD: `dcc9e7a`

This prototype remains useful as a record of the film-selection UI, browser playback, and the failed plate-plus-overlay approach. Do not continue polishing it as if it were the real VibeShack site.

## 4. Product vision

The VibeShack portfolio should feel like entering a private screening room, not opening another card gallery.

The theater occupies the full page beneath the real VibeShack header. The selected work remains the visual focus. Project selection, controls, metadata, accessibility, and links remain website UI.

The intended emotional sequence is:

```text
Enter the theater
    -> see a quiet lights-on room
    -> choose a project
    -> house lights dim
    -> screen wakes up
    -> movie begins
    -> movie color affects the theater
    -> choose another project or return to idle
```

The experience should feel premium, cinematic, restrained, and easy to use. It should not feel like a game HUD, a nightclub, a generic red-velvet cinema, or an effects demo.

## 5. Approved interaction model

### 5.1 Idle state

When a visitor enters `/our-work/`:

- the real site header remains visible;
- the theater fills the remaining viewport;
- the camera is already in its final locked position;
- house lights are on at a tasteful level;
- the screen is dark, branded, or showing a selected poster;
- a subtle seamless idle render prevents the room from feeling like a still image;
- the film rail is visible and usable.

### 5.2 Selecting a film from idle

The browser preloads the selected integrated theater asset before beginning the visible transition.

Expected sequence:

1. The selected film card becomes active.
2. The idle theater continues while the selected asset buffers.
3. House lights dim over approximately 1.5 to 2 seconds.
4. The screen fades from black.
5. The selected integrated theater video takes over on an identical matching frame.
6. Film audio begins only after a user gesture.
7. Film color and light transport become visible across the theater.

### 5.3 Switching films while the theater is dark

Do not raise all house lights between films unless the owner later requests that behavior.

Recommended sequence:

1. Fade the current audio and picture.
2. Hold a short projector-style black screen.
3. Keep the room in the same dark base state.
4. Crossfade to the new preloaded integrated theater video.
5. Fade the new audio and picture in.

### 5.4 Ending a film

Recommended sequence:

1. Film fades to black.
2. Film-driven spill disappears.
3. House lights rise gradually.
4. The idle theater loop resumes on its matching frame.

### 5.5 Why the handoff can be seamless

Every render must share exactly the same:

- camera object;
- lens and sensor settings;
- crop and resolution;
- theater geometry;
- seat positions;
- base material versions;
- color management;
- exposure;
- starting dark-theater frame;
- output frame rate;
- transition timing.

The idle transition ends on the same dark-theater frame where every film-specific render begins. The website swaps files while those frames match.

## 6. What the website owns and what Blender owns

### Blender owns

- theater geometry;
- seats, stage, wall panels, screen surround, ceiling, floor, and sconces;
- screen mesh and film texture placement;
- physical material response;
- house-light animation;
- film-driven diffuse light transport;
- justified specular reflections;
- camera, lens, focus, depth of field, exposure, and tone mapping;
- idle, lights-down, film-playing, and lights-up renders;
- final full-theater image sequence.

### The website owns

- the real VibeShack header and navigation;
- film rail and categories;
- project title, creator, category, year, and case-study link;
- loading, error, buffering, and fallback states;
- keyboard and touch behavior;
- play, pause, seek, mute, captions, and fullscreen controls;
- preloading and crossfading between full-theater videos;
- reduced-motion behavior;
- responsive/mobile fallbacks;
- SEO and project routes.

### Important distinction

The website still plays video files. The difference is that the files are complete Blender-rendered theater experiences, not raw films placed over a theater image.

## 7. Theater build history

### v001: blockout

Primary files:

```text
blender/vibeshack_cinema_theater_v001.blend
blender/scripts/build_theater_blockout.py
renders/theater_blockout_v001.png
```

Established the room shell, seating tiers, screen, stage, central aisle, basic acoustic walls, camera, and first lighting hierarchy.

### v002: first polished room

Primary files:

```text
blender/vibeshack_cinema_theater_v002.blend
blender/vibeshack_cinema_theater_v002_cycles.blend
blender/assets/vibeshack_premium_cinema_seat_v001.blend
blender/scripts/build_theater_polished_v002.py
renders/theater_polished_v002_cycles.png
```

Added a detailed modular seat, architectural ceiling, wall panels, sconces, screen-side fluting, stage details, aisle lighting, and a Cycles proof.

### v003: orientation and material correction

Primary files:

```text
blender/vibeshack_cinema_theater_v003.blend
blender/assets/vibeshack_premium_cinema_seat_v002.blend
blender/scripts/build_theater_polished_v003.py
renders/theater_polished_v003_cycles.png
```

Corrected the seats so they face the screen, added rear upholstery detail, and replaced procedural-only surfaces with locally stored Poly Haven leather, wool, and carpet PBR maps.

### v004: reference-matched photoreal rebuild

Primary files:

```text
blender/vibeshack_cinema_theater_v004.blend
blender/assets/vibeshack_luxury_recliner_v003.blend
blender/scripts/build_theater_photoreal_v004.py
renders/theater_photoreal_v004_cycles.png
```

Reframed the room around the approved generated concept, widened the architectural screen to 2.35:1, deepened the auditorium, simplified the ceiling, and upgraded materials to 4K PBR sources.

### v005: approved production-realism theater

Primary files:

```text
blender/vibeshack_cinema_theater_v005.blend
blender/vibeshack_cinema_theater_v005_cycles.blend
blender/assets/vibeshack_hero_recliner_v004.blend
blender/scripts/build_theater_photoreal_v005.py
blender/scripts/render_theater_cycles_v005.py
blender/scripts/finish_theater_v005.sh
renders/theater_photoreal_v005_final.png
```

This is the approved theater design foundation.

Key qualities:

- enlarged 21.2 by 29.0 by 8.8 meter auditorium;
- 13.9-meter-wide 2.35:1 screen;
- 24 detailed recliners across three risers;
- readable textile wall bays and reveals;
- controlled sconces and local light pools;
- fluted screen surround and concealed grazers;
- stage fascia, stairs, aisle markers, and practical floor lights;
- neutral charcoal ceiling;
- restrained VibeShack red near the lower room;
- f/8 hero camera focused near the middle row;
- 384-sample Cycles master and restrained photographic finish.

### v006: static plates and browser spill experiment

Primary files:

```text
blender/vibeshack_cinema_theater_v006_house_off.blend
blender/scripts/render_theater_house_off_v006.py
blender/scripts/render_theater_receiver_masks_v006.py
renders/theater_v006_house_off.png
renders/web-masks/receiver_*.png
```

The browser crossfaded between lights-on and lights-off Blender plates. It sampled the film and projected soft color through Blender-generated receiver masks.

This proved that playback could control the apparent lighting state, but the movie and room still passed through different render and color pipelines. The screen looked sharper and more contrasty than the theater. The result felt composited.

Production verdict: rejected.

### v007: Blender-integrated still proof

Primary files:

```text
blender/vibeshack_cinema_theater_v007_integrated_video.blend
blender/scripts/render_theater_integrated_video_v007.py
renders/theater_v007_integrated_video.png
```

Placed a real film frame on explicit screen geometry inside Blender and rendered screen plus room together. Added separate broad response lights for the stage and auditorium.

This restored shared perspective, exposure, lens response, material response, occlusion, and color management.

### v008: Blender-integrated moving proof

Primary files:

```text
blender/vibeshack_cinema_theater_v008_integrated_animation.blend
blender/scripts/render_theater_integrated_video_v008.py
blender/textures/video_sequences/teyo_chilled_v008/frame_0001.png ... frame_0144.png
renders/theater_v008_frames/frame_0001.png ... frame_0144.png
renders/theater_v008_integrated_animation.mp4
```

This is the approved architecture test.

It placed a six-second section of TeYo's *Chilled* on the screen as an image sequence, sampled frame colors, animated room-response lights, and rendered the film and theater together.

### v009: raw real-time GLB attempt

Primary files:

```text
blender/vibeshack_cinema_theater_v009_web_master.blend
blender/scripts/export_theater_web_v009.py
web/public/models/vibeshack_theater_v009.glb
```

The scene was simplified and exported as a 14 MB Draco-compressed GLB. Blender lights were removed so the website could create runtime lights.

This made live video texture playback possible in principle, but the browser version did not reproduce the approved Blender materials, path-traced lighting, camera feel, or photographic finish. It looked darker, flatter, more distant, and less premium.

Production verdict: not launch-ready. Preserve it only as an experiment for a future baked-lightmap real-time pipeline.

### Hosted v4 plate prototype

Primary files:

```text
web/app/TheaterExperience.tsx
web/app/globals.css
web/public/media/theater-v005.png
web/public/media/theater-house-off-v006.png
web/public/media/masks/receiver_*.png
web/public/media/remote-preview.mp4
web/public/media/chilled-preview.mp4
```

The GLB path was replaced with a high-quality static v005 plate. A normal HTML `<video>` was positioned at fixed screen coordinates. CSS and masked gradients simulated colored spill.

This restored the theater's still-image quality and made film switching reliable, but it recreated the v006 mismatch. The screen is a browser rectangle over a rendered photograph.

Production verdict: archived prototype, not the foundation for the real site.

## 8. What was learned from Apple Vision Pro

Apple does not publish the internal source for the Apple TV Cinema Environment. Apple does publish the relevant system architecture through the Destination Video sample and RealityKit documentation.

Official references:

- [Enabling video reflections in an immersive environment](https://developer.apple.com/documentation/visionOS/enabling-video-reflections-in-an-immersive-environment)
- [Destination Video](https://developer.apple.com/documentation/visionos/destination-video)
- [RealityKit video scene content](https://developer.apple.com/documentation/realitykit/scene-content-videos)
- [Watch movies and TV in an Environment on Apple Vision Pro](https://support.apple.com/en-gb/guide/apple-vision-pro/tan7241583f5/26/visionos/26)

The important principles are:

### 8.1 The player belongs to the environment

Apple docks the player into a defined 3D region. The screen is not a flat interface rectangle placed over a finished screenshot of the environment.

VibeShack equivalent: the film is a material on a physical Blender screen mesh, or eventually a runtime video texture on the exported screen mesh.

### 8.2 Diffuse and specular response are different

Apple exposes separate reflection behavior:

- specular reflections preserve recognizable image detail on glossy surfaces such as metal, mirrors, and water;
- diffuse reflections carry softer, low-frequency color and light across rough surfaces.

VibeShack equivalent:

- chrome, glossy leather edges, and appropriate stage surfaces may receive restrained recognizable response;
- carpet, fabric walls, ceiling, and broad leather surfaces should receive soft color transport, not a blurred duplicate of the movie.

### 8.3 Diffuse response is spatially shaped

Apple describes an emitter UV set plus an attenuation UV set and attenuation texture. The effect is shaped by the screen's position, receiver geometry, distance, angle, and falloff.

VibeShack equivalent: do not paint the entire room with the frame's average color. Use receiver-specific transport with controlled falloff and geometry-aware placement.

### 8.4 Environment state is coordinated with playback

Apple's sample includes environment variants and virtual scene lighting. Playback and environment presentation are coordinated.

VibeShack equivalent: house lights dim independently, the screen becomes active, film transport rises, and the room returns to idle when playback ends.

### 8.5 What not to claim

Do not claim that we have Apple's proprietary Cinema Environment source or that our web implementation is identical to RealityKit. We are applying the published architectural principles to a fixed-camera web theater.

## 9. Exact v008 facts

The v008 script and rendered proof were inspected at this checkpoint.

### Source and timing

- Source segment: TeYo, *Chilled*, approximately `00:52` to `00:58`
- Frame count: 144
- Frame rate: 24 fps
- Duration: 6 seconds
- Blender screen source sequence: 1280 by 544 PNG frames

### Render and encode

- Theater output: 1280 by 720
- Renderer: Blender Eevee
- View transform: AgX, Medium High Contrast
- Video codec: H.264 High Profile
- Pixel format: yuv420p
- Video bitrate: approximately 2.0 Mbps
- Audio codec: AAC LC
- Audio bitrate: approximately 199 kbps
- Total bitrate: approximately 2.21 Mbps
- File size: approximately 1.66 MB

### Screen and lighting behavior

- The film sequence is an emissive screen material.
- Emission strength is `2.2` in the proof script.
- House lights are reduced before frame one. They do not animate from on to off.
- Frame colors are sampled from a coarse 6 by 4 grid.
- Samples are evaluated every second frame.
- Three area lights represent left, center, and right screen response.
- One additional area light provides stage bounce.

### Why v008 looked integrated

The screen, theater, camera, exposure, materials, bloom, and color management were rendered together. The film therefore shared the same perspective, sharpness hierarchy, lens treatment, occlusion, and room response.

### Why v008 looked low resolution

The complete theater was only 720p. The cinema screen occupied only part of that 720p image, so the visible film received substantially fewer pixels than the source frame. The full result was then encoded at only about 2 Mbps.

The architecture was correct. The source resolution, output resolution, and delivery encode were preview quality.

### Why v008 lighting was not finished

The proof did not contain a real lights-on to lights-off animation. Its response lighting used only four broad transport lights and coarse temporal/spatial sampling. It was designed to prove moving color integration, not final projection behavior.

### v010: first production-quality proof

The v010 proof implements the planned production upgrade with *The Client*.

Primary files:

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/vibeshack_cinema_theater_v010_client_production_proof.blend
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/build_theater_production_proof_v010.py
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/master_theater_production_proof_v010.sh
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/video/theater_v010_client_production_proof_prores.mov
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v010_client_production_proof_4k.mp4
```

Exact production facts:

- Source master: `/Users/emmanueltay/Desktop/VibeShack Footage/The Client [4K master].mp4`
- Source segment: `01:37.500–01:44.507`
- Timeline: 288 frames / 12.012 seconds at native `24000/1001` fps
- Output: 3840×2160, Eevee, AgX Medium High Contrast
- Sequence: 288 16-bit RGB PNG frames
- Transition: lights-on hold, true house-light dim, dark handoff, film
  fade-in/out, and matched lights-up return
- Transport: 20 every-frame, temporally smoothed lights across diffuse,
  lower-room, stage, glossy, and rear-wall receiver groups
- Screen-fit review setting: 16:9 contain with black side mattes inside the
  2.35:1 architectural screen; not a final owner-approved crop policy
- ProRes master: 10-bit 4:2:2, 48 kHz stereo 24-bit PCM
- Review copy: 4K H.264, CRF 16, 48 kHz stereo AAC

Validation completed on 2026-07-17: every PNG decodes at 3840×2160
`rgb48be`; the ProRes and H.264 outputs both decode end to end; each contains
4K `24000/1001` video, stereo audio, and a 12.012-second duration.

This proof is ready for owner review. It does not authorize full-film batch
rendering, the final screen-fit policy, or production website deployment.

### v011: shadow-atlas correction

Owner screenshots exposed visible breakup in the first and last two seconds of
v010. The files were valid, but the rendered pixels were not: the v010 scene
had 82 shadow-casting lights and repeatedly requested approximately 6196 tiles
from Eevee's 2048-tile shadow buffer.

The versioned v011 scene keeps shadows on 12 structural lights and leaves the
decorative practicals and film-transport lights shadowless. A 4K stress render
now reports zero `Shadow buffer full` warnings. Frames 1–48 and 241–288 were
re-rendered; the unaffected integrated-film frames 49–240 were preserved.

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/vibeshack_cinema_theater_v011_client_shadow_fixed.blend
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/fix_theater_shadow_budget_v011.py
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/master_theater_production_proof_v011.sh
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/video/theater_v011_client_shadow_fixed_prores.mov
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v011_client_shadow_fixed_4k.mp4
```

Validation: all 96 corrected PNGs decode at 3840×2160 `rgb48be`; the corrected
ProRes and H.264 files contain exactly 288 frames at `24000/1001`, 48 kHz stereo
audio, and a 12.012-second duration; both decode end to end. Use v011—not v010—
for owner review.

### Current material-realism finding

The theater already loads 4K Poly Haven color, roughness, and normal maps for
leather, acoustic wool, and carpet. The remaining synthetic look is driven more
by repeated procedural seat forms, limited upholstery wrinkles and seam
tension, missing displacement and wear variation, and lighting/material
calibration than by texture resolution alone. Prioritize one high-quality hero
recliner model and targeted shader/UV work before buying a broad material
subscription.

### v012: closer composition and practical-light refinement

The owner requested a viewpoint one row closer to the screen and side lights
that do not read as glossy orange plastic before they dim. The v012 scene moves
the camera forward by the exact 4.5-meter seat-row spacing while preserving the
34.5 mm lens. Its depth-of-field focus plane moves forward by the same amount.

The side-light lenses now use a matte diffuse-plus-emission shader instead of
the prior glossy Principled response. Their area lights are larger and softer,
with almost no specular contribution. The wall pools, vertical grazes,
perimeter wash, and lower red wash were softened, and the leather shaders
received lower specular/coat values plus a small roughness lift.

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/vibeshack_cinema_theater_v012_composition_lighting.blend
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/improve_theater_composition_lighting_v012.py
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/render_v012_speed_preview.py
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v012_speed_preview_frames/
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v012_composition_lighting_contact.jpg
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v011_to_v012_before_after.jpg
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/renders/theater_v012_continuous_quicktime_review.mov
```

Seven 1920x1080 key frames rendered at 16 samples in approximately 28 seconds.
Visual review confirms a substantially larger screen without clipping, a clean
foreground-seat silhouette, and side practicals that read as restrained warm
lenses rather than shiny plastic. No full v012 animation or 4K master has been
rendered; the speed-first workflow keeps that work gated on owner approval. The
first QuickTime attempt incorrectly used crossfades between seven still states
and was rejected. It was replaced at the same path with a true continuous
1280x720 Blender render of all 288 frames and correctly timed audio. The
corrected movie validates as 288 H.264 frames at `24000/1001` plus 48 kHz
stereo AAC and decodes end to end.

## 10. Why the current hosted result is wrong

The current hosted page uses:

- a static high-quality v005 Blender render;
- a second static lights-down plate;
- an HTML `<video>` positioned at `left: 25.89%`, `top: 29.35%`, `width: 48.18%`, and `height: 36.3%`;
- receiver-mask images;
- CSS gradients and blend modes based on sampled left, center, and right frame colors.

The browser video does play, but it is not a material on the theater's screen mesh. It does not share Blender's tone mapping, depth of field, screen material, indirect lighting, reflections, or final render pass.

The visual symptoms are expected:

- the film is sharper than the room;
- contrast and black levels do not match;
- the movie looks like a rectangle on top of the theater;
- spill appears behind or around the movie rather than emerging from it;
- the room can feel like a background instead of a physical receiver;
- the camera and framing can feel different when CSS cover behavior changes the plate crop.

No amount of additional CSS blur or glow fully fixes this architectural mismatch.

## 11. Approved launch production pipeline

### Phase A: Curate the launch films

The owner approved a three-film launch set on 2026-07-17:

1. The Client
2. The Giver
3. Body Is Tea

The exact local source files and inspected media properties are recorded in:

```text
/Users/emmanueltay/Desktop/VibeShack Cinema Experience/video/launch_films.json
```

Do not add other current projects to the theater launch without a new owner
decision.

For each selected project, confirm:

- rights and approved edit;
- highest-quality available master;
- exact duration or approved excerpt;
- audio master;
- frame rate;
- aspect ratio and crop policy;
- captions or transcript availability;
- poster frame and metadata.

Do not use hover clips or downloaded low-resolution web proxies as final Blender sources.

### Phase B: Create the production Blender template

Do not rebuild the room for each film.

Create one versioned production template derived from v005 and v008. Recommended next version name:

```text
blender/vibeshack_cinema_theater_v010_production_template.blend
```

The template should include:

- locked approved theater geometry;
- locked hero camera;
- locked color management;
- named screen material inputs;
- separate rough and glossy receiver groups;
- house-light controls;
- screen fade controls;
- production transport lights;
- reusable lights-down and lights-up timing;
- output collections and render settings;
- film-specific configuration stored outside destructive scene edits.

Create a deterministic script instead of manually rebuilding nodes for every film.

Implemented proof milestone: v010 now provides the reusable deterministic
structure and *The Client* review render. Convert it into the final shared
template only after owner review of its timing, screen fit, and Eevee quality.

### Phase C: Improve the film transport model

Upgrade the v008 proof as follows:

- sample every frame rather than every second frame;
- increase from four broad response zones to approximately 12 to 20 carefully aimed zones;
- smooth luminance and color changes over time to prevent flicker;
- preserve screen hue without turning the room into nightclub lighting;
- treat diffuse and specular receivers separately;
- keep recognizable reflections limited to materials and angles that justify them;
- use low-frequency color on walls, carpet, ceiling, and broad leather;
- keep the screen as the brightest and most saturated object;
- animate house lights independently from the film response;
- prevent exposure pumping when the film cuts from dark to bright.

### Phase D: Build the idle and transition assets

Create:

1. a lights-on idle loop;
2. a lights-down transition;
3. a lights-up transition;
4. a dark hold frame or loop used during film switching;
5. one integrated theater render per selected film.

All assets must share matching first and last frames where the website handoff occurs.

### Phase E: Run a production-quality proof before full films

Do not render several complete films before the pipeline is approved.

First produce one 8 to 12 second proof containing:

- a lights-on opening;
- the full dimming transition;
- a cool scene;
- a warm scene;
- a bright cut;
- a dark cut;
- a brief pause or end state;
- the lights-up return.

Render an Eevee and Cycles comparison at the intended final resolution. Choose the production renderer only after comparing quality, render time, temporal stability, and noise.

For maximum quality, Cycles is the reference. If a full-length Cycles render is operationally impractical, Eevee must be tuned against the Cycles reference and approved by the owner. Do not silently substitute a faster renderer.

Current result: the v011 shadow-fixed 4K Eevee proof is complete and validated. Owner review
must decide whether it is sufficient or whether a targeted Cycles comparison is
required before full-film rendering.

### Phase F: Render an image sequence

Do not render the production master directly to MP4.

Preferred workflow:

1. Render 16-bit PNG or half-float EXR frames.
2. Preserve the frames until the final encode is approved.
3. Create a high-quality mezzanine master such as ProRes.
4. Create web derivatives from the mezzanine master.
5. Mux audio once at the mastering stage.

This protects the render from a failed encode and avoids repeated lossy compression.

### Phase G: Master for the web

The initial quality target should be a 4K master with tested 1080p and 1440p/4K web derivatives.

Validate:

- source and output color tags;
- black level and highlight retention;
- browser-compatible audio;
- no additional sharpening halo around the screen;
- adequate bitrate for dark gradients and fine wall textures;
- no banding in the ceiling or screen spill;
- playback in Safari and Chromium-based browsers.

Do not repeat the v008 720p, 2 Mbps review encode as a final delivery.

### Phase H: Integrate into the real Next.js site

The production component belongs in:

```text
/Users/emmanueltay/Developer/vibeshack-website-reconcile
```

Likely integration surfaces:

```text
app/our-work/page.tsx
components/our-work/CinemaExperience.tsx        # new client component
components/our-work/CinemaFilmRail.tsx          # optional split
lib/seo/workProjects.ts
public/studio-videos/cinema/                     # local development derivatives
public/studio-images/cinema/                     # posters and fallbacks
```

Do not duplicate the prototype's fake navigation. The real site header already comes from `app/layout.tsx`.

The film rail should consume the existing project catalog where practical instead of creating a second unsynchronized list.

### Phase I: Use a two-player crossfade system

Use two full-frame theater video elements:

- active player;
- standby/preload player.

The standby player loads the next integrated film while the active player remains visible. At the matching transition frame, opacity and audio are crossfaded. Then the former active player becomes the next standby player.

Recommended state machine:

```text
idle
  -> preloading
  -> dimming
  -> playing
  -> switching
  -> playing
  -> ending
  -> lights-up
  -> idle

Any state
  -> error fallback
```

Do not preload every 4K film at page load. Preload the idle asset, selected film metadata, and the next likely choice. Begin larger downloads on intent, selection, or a controlled idle window.

### Phase J: Preserve website usability

The cinema must not remove:

- crawlable project names and summaries;
- links to project case-study pages;
- category filtering;
- keyboard navigation;
- accessible controls and labels;
- captions where available;
- reduced-motion support;
- a poster/static fallback;
- a simplified mobile experience;
- sensible behavior on slow networks and low-power devices.

## 12. Real-time 3D future path

A future version can support arbitrary films without prerendering each theater sequence.

That version requires more than exporting the current Blender scene as GLB.

Required work includes:

- web-optimized geometry and UVs;
- baked high-resolution lightmaps;
- compressed KTX2 textures;
- exact Blender camera transfer;
- ACES/AgX-equivalent color calibration;
- a real video texture on the screen mesh;
- receiver-specific diffuse transport;
- view-dependent specular response;
- playback-driven practical lights;
- performance tiers and non-3D fallback;
- testing across desktop and mobile GPUs.

The web renderer loads the theater once and places any selected film on the screen at runtime. That is more scalable, but it is a separate 3D engineering project. It should be measured against the approved Blender-integrated proof before being allowed to replace it.

## 13. Things future builders should do

- Start from v005 for theater quality and v008 for film integration.
- Version every structural Blender change.
- Keep the hero camera locked after the production template is approved.
- Use the highest-quality approved film master.
- Render image sequences before video encoding.
- Keep rough and glossy response separate.
- Keyframe house lights independently from film-driven transport.
- Test bright, dark, warm, cool, and fast-cut footage.
- Match transition boundary frames exactly.
- Integrate only into the real local site on port 3011.
- Use the existing work project data and real header.
- Preserve project SEO and case-study routes.
- Measure bandwidth, memory, decode load, and mobile behavior.
- Record every imported asset, source, creator, and license.
- Keep this handoff updated at each major checkpoint.

## 14. Things future builders should not do

- Do not return to static plate plus HTML screen overlay as the production solution.
- Do not try to hide a separate screen layer with more blur, glow, or CSS masks.
- Do not use the hosted Sites prototype as the real product repository.
- Do not duplicate the VibeShack navigation inside the cinema component.
- Do not change camera framing between idle, transition, and film renders.
- Do not stretch 16:9 work across the 2.35:1 screen.
- Do not use 720p or low-bitrate review files as final sources.
- Do not render a long production sequence directly to MP4.
- Do not use a YouTube iframe as a source for film-driven browser sampling.
- Do not expect a raw GLB export to look like a 384-sample Cycles render.
- Do not bake website controls or project metadata into Blender pixels.
- Do not render all portfolio films before the short production proof is approved.
- Do not deploy or push the real website without explicit owner approval.
- Do not reintroduce removed VibeShack products while editing shared navigation or data.

## 15. Existing website content relevant to the cinema

The real project catalog is in:

```text
lib/seo/workProjects.ts
```

It already contains:

- titles;
- categories;
- creators/clients;
- years;
- images and posters;
- hover clips;
- local film files for selected projects;
- YouTube IDs for others;
- summaries and credits;
- service and case-study relationships.

Examples of current local full-film files:

```text
public/studio-videos/film-remote-v20260716.mp4
public/studio-videos/film-the-client-v20260716.mp4
public/studio-videos/film-unforgiven-v20260716.mp4
public/studio-videos/film-the-giver-v20260717.mp4
```

These website files may be acceptable playback derivatives, but they are not automatically the highest-quality Blender source masters. Locate and approve the original masters before final rendering.

## 16. Current Blender assets and material provenance

Internal reusable seats:

```text
blender/assets/vibeshack_premium_cinema_seat_v001.blend
blender/assets/vibeshack_premium_cinema_seat_v002.blend
blender/assets/vibeshack_luxury_recliner_v003.blend
blender/assets/vibeshack_hero_recliner_v004.blend
```

The latest approved hero recliner is v004.

Production materials use locally stored Poly Haven assets:

- `fabric_leather_01`
- `poly_wool_herringbone`
- `dirty_carpet`

License and source details are in:

```text
blender/textures/POLYHAVEN_LICENSE.md
docs/ASSET_INVENTORY.md
```

Do not introduce an unlicensed purchased model or texture without documenting it.

## 17. Operating instructions for the real website

The real site is currently expected to remain available on port 3011.

```bash
cd "/Users/emmanueltay/Developer/vibeshack-website-reconcile"
npm run dev -- -p 3011
```

Important: `npm run build` and the dev server share `.next`. A production build can make the live development server return errors. After a build, restart the dev server on port 3011 or serve the completed build intentionally.

Required validation before claiming a website change is complete:

```bash
npm run lint
npx tsc --noEmit
npm run build
SEO_AUDIT_BASE_URL=http://localhost:3011 npm run seo:audit
```

Then confirm the changed experience at:

```text
http://localhost:3011/our-work/
```

Do not deploy or push without explicit owner approval.

## 18. Blender execution pattern

Blender is installed at:

```text
/Applications/Blender.app
```

Existing scripts were written for Blender 5.2.0 LTS. The Eevee engine identifier used by the project is `BLENDER_EEVEE`.

Typical headless script pattern:

```bash
/Applications/Blender.app/Contents/MacOS/Blender \
  --background \
  "/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/vibeshack_cinema_theater_v005.blend" \
  --python "/Users/emmanueltay/Desktop/VibeShack Cinema Experience/blender/scripts/<script>.py"
```

Do not run a full-length render until the short proof and output settings are approved.

## 19. Storage and delivery implications

A curated Blender-integrated launch uses more storage because each selected film has its own complete theater render.

That does not mean remodeling the theater for every film. It means reusing the same scene and recalculating the light response for each film's frames.

Example:

```text
3 minutes x 60 seconds x 24 fps = 4,320 rendered frames
```

The cost scales with film duration, resolution, samples, and renderer choice.

Keep separate classes of output:

- source master or approved input;
- temporary Blender image sequence;
- high-quality mezzanine master;
- website delivery derivative;
- poster/fallback image.

Do not commit large source masters, EXR sequences, or generated render caches to the real website repository. Decide on a CDN or object-storage delivery strategy before production assets are finalized.

## 20. Open owner decisions

Resolved on 2026-07-17:

- Launch set size: three films.
- Launch films: The Client, The Giver, and Body Is Tea.

The following remain intentionally unresolved:

1. Does each project play in full or as a curated excerpt?
2. What is the screen policy for 16:9 work inside the 2.35:1 architectural frame: contain, designed matte, or approved crop?
3. Should the initial idle screen show the VibeShack logo, a featured poster, or black?
4. Should switching films keep the room dark or briefly raise practical lighting?
5. What captions are available?
6. Where will final web video derivatives be hosted?
7. Does the short proof justify full Cycles rendering, or does a tuned Eevee result pass the owner comparison?
8. What is the approved mobile fallback?
9. Should the shared theater output use 23.976 fps, 24 fps, 25 fps, or a different conforming strategy for the mixed-frame-rate sources?

Do not guess these answers when they materially change the result.

## 21. Immediate next steps

The next builder should perform these steps in order:

1. Read `AGENTS.md`, `CLAUDE.md`, and this checkpoint.
2. Verify the real local site is still available at `http://localhost:3011/our-work/`.
3. Review `renders/theater_v012_composition_lighting_contact.jpg` and
   `renders/theater_v011_to_v012_before_after.jpg` with the owner.
4. If the corrected continuous v012 QuickTime, closer composition, and revised
   practicals are approved, proceed to a new 4K master.
5. Confirm the 16:9-to-2.35:1 screen policy and whether the tuned Eevee result
   is sufficient or requires a targeted Cycles comparison.
6. Preserve the v011 Blender scene, corrected frames, and ProRes master as the
   validated motion reference. Keep v010 only as historical failure evidence.
7. After proof approval, build the two-player crossfade prototype inside the
   real Next.js `/our-work/` route.
8. Validate seamless switching, playback, accessibility, and mobile fallback locally.
9. Only after proof and web-transition approval, batch the three curated films.

## 22. Definition of done for the launch experience

The launch cinema is not done until:

- the owner approves the theater in lights-on, dimming, playing, switching, and ending states;
- the film appears physically integrated into the room;
- film color affects appropriate room surfaces without flooding the theater;
- the screen remains the brightest visual priority;
- idle-to-film and film-to-film handoffs do not reveal file changes;
- the camera never jumps;
- the output is sharp enough at the intended viewport;
- audio and controls work after a user gesture;
- buffering and errors have graceful fallbacks;
- reduced-motion and mobile users receive a coherent experience;
- project titles, filters, links, and SEO remain intact;
- the local real website passes lint, type checking, build, and route review;
- no production deployment occurs without owner approval.

## 23. Final checkpoint summary

The project proved the hardest visual idea with v008, completed the first
production-quality implementation with v011, and now has a faster, more
screen-forward v012 composition with restrained practical-light and leather
response. When the film is inside Blender and the room is rendered with it, the
theater feels unified.

The mistake was not the v008 architecture. The mistake was treating its preview resolution and incomplete lighting animation as a reason to replace it with a separate browser video layer.

The next decision is owner approval of the v012 look against the validated v011
motion proof. After that, use the approved template for the three-film launch
library and integrate the experience into the real VibeShack Next.js site at
`http://localhost:3011/our-work/`.

The future real-time 3D version should be pursued only as a measured scalability project that must match the approved Blender-integrated reference.
