# Frontend Assessment Answers

### 1. How to run
0. Node.js and npm needs to be installed
1. Clone the repository and run `npm install`.
2. Run `npm start` to spin up the local development server.
3. Open the provided `localhost` URL in your browser.

**Deployed URL:** [github pages link](https://ahmadsaeedzaidi.github.io/pomodoro-timer)

### 2. Stack & design choices
**Stack:** I chose Vanilla HTML, CSS, and JavaScript (utilizing modern ES Modules). I haven't done web development properly before, I just know the basics (which i learned from coursera courses), and I know coding logic from cpp and python. I don't know any frameworks, so i didn't use them.

**Design Decisions:**
I started from an idea, of an anime girl looking at the timer, kind of like how I look at timers, hoping they move faster. I found an image of miku, I gave it to gemini to extend the image to this wide format.
1. I made the image a header element, and I wanted the UI to sync with it. The container class is exactly 37.5 + 8px, because I manually aligned it while zooming in. In mobile mode, the miku image is zoomed and cropped, so the container element also scales to become biggr and still stay synced. It gives the illusion that the app has some fancy backend styling, when it's actually just pixel math. This kind of duct tape is why I like working in pure css lol.

2. I wanted precise control over the time input, so I added 2 number inputs,  for minutes and seconds, with a colon in between. But to keep it minimal I just added a title and aria label, so that it's both minimal and accessible on hover and for screen readers. I made the start button pink, to make it pop-out and easy to find against the blue.

### 3. Responsive & accessibility
**Responsiveness:** The layout uses CSS Flexbox. On a 1080p laptop, the main timer container and the settings sit elegantly centered with padding on the sides. On a phone, the containers zoom in and , the settings inputs utilize `.time-input-group` wrapping to prevent horizontal overflow, and the font sizes scale down responsively using `rem` units. I tested it 

**Accessibility:** 
I added `aria-live="polite"` to the timer display and the history list. This ensures that screen readers will automatically announce when the timer ticks down or when a new session is logged to the history, without requiring the user to manually refocus the element.

**Accessibility Skipped:**
- I know this specific combination of pink and teal can cause issues for colorblind people, but I was too far deep into the miku aesthetic to change it. I did use pink sparingly, only to add importance, but the history section has pink text on blue background, which is not great for color contrast. I would fix this in a production app.

### 4. AI usage
I utilized AI in various places
- **boilerplate** I prompted the AI to generate the initial packages.json (I don't know the format for that to be honest), as well as a boilerplate styles.css that I edited to my need.
- **image generation** the [image](assets/miku_header.png) was edited using gemini (I cropped out the water mark, and made some colour adjustments in gimp, as well as cropping and upscaling it + pixel measurements for alignment)
- **Architecture Refactoring:** After building a functional single file main.js, I asked claude to help me plan a object oriented version. I moved the states into state.js, then i moved dom references and heavy lifting into ui.js, and finally the main logic into a simpler `main.js`. `ui.js` is mostly AI formatted.
- **Responsive Formatting:** I added flex_wrap for the time input boxes inside the main container, because they would go outside the container on thin screens. I also added font size reduction on mobile devices for the history section, amoung other things.
- **Logic Debugging:**  After the refactor, the long break (15 minutes) was being skipped because of a race condition. I found the ordering bug (isLongBreak was evaluated before the cycle advances, and thus the check never happens and the long break is replaced by a short break). I fixed the order and the bug is now patched.

### 5. Honest gap
**Gap:** The app currently uses sounds I hardcoded. In a real app, the user should be able to upload their own sounds, or at least select from a dropdown of sounds.
**How I'd fix it:** Given another day, I would add robust handling for this, currently the system doesn't handle how long audio tracks are, and there are still occasional bugs with audio looping forever (which is why I added the stop audio button, as an emergency kill switch). 
