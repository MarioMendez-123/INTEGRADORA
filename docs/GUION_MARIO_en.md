# Mario's script — English, slide by slide

Slide numbers are for the current deck (44 slides). `[→]` = press next (clicker or phone) to reveal the next step inside the slide.
Everything below comes from what is on the slides; do not add numbers that are not there.

## 0. Opening with Lumina (before the slides)

*Click once on the laptop, then press → to start the intro video. When it ends Lumina turns on and greets you:*
**Lumina:** "Hello, I'm Lumina, the robot of the Aether project."

Say, one at a time, always starting with her name:
1. "Lumina, how are you?" → *"Very well and ready to work."*
2. "Lumina, show us who you are." → *"I'm the cart. This is how I'm built."* (the 3D cart appears)
3. "Lumina, show me the inside." → *"Let me show you my interior, layer by layer."*

Then press → to open the slides. (If she does not hear you, → runs the same three steps without talking.)

---

## Slide 1 — Title

"Good afternoon. We are Aether Industrial Systems. I'm Mario Méndez, and with me are Uriel, Emmanuel, Pedro, David and Isaac.
What you just saw is Lumina, the voice and face of our system. Behind her is a small manufacturing line that inspects parts, moves them with an autonomous cart and keeps an honest inventory. I'll explain how it works."

## Slide 11 — General workflow  (4 steps)

"This is the whole flow in one picture."
**[→ 1]** "A part arrives on the belt. A fixture holds it, and the camera sees it."
**[→ 2]** "The vision system judges the part every half second, and only five equal readings in a row count. One blurry frame can never decide anything."
**[→ 3]** "If it is PASS, the belt advances, the cart loads up to six fixtures and delivers them to the unload table."
**[→ 4]** "If it is FAIL, the piston ejects the part and it goes to scrap."
*(last state)* "And every step is logged, so nothing happens without leaving a trace."
→ *Next slide is mine too.*

## Slide 12 — How it works · Perception  (4 steps)  *(with Uriel)*

"Let's see how the system goes from an image to information."
"The camera on the cart sends 1080p video."
**[→]** "YOLO draws a box around each part and names its class. On our validation photos it reaches an mAP50 of 0.98, but that is a small set, so we treat it as a guide, not a guarantee."
**[→]** "A code reader then reads the barcode or QR on the part: the exact product, no guessing."
**[→]** "ArUco only confirms position. A reflection can give a wrong but valid ID, so it never works alone."
**[→]** "All of that becomes one observation with a unique event ID. The camera frame here is an illustration, and the code and ID are examples. The point: finding something is not understanding it, and each step adds certainty."

## Slide 13 — How it works · Inventory  (3 steps)

"Now, what we observe is not the same as what we declare." *(Start: 430 observations, 51 declared products.)*
"Observations are raw: they are only added, never changed. The declared inventory has one row per product and nothing is ever deleted."
**[→ complete run]** "In a complete run, every product was seen, so the new ones are declared."
**[→ partial run]** "In a partial run, the observations are saved, but the declared inventory is not overwritten. A partial run can never silently replace what we had."
**[→ invalid run]** "An invalid run is kept for audit and is never used to change the inventory."
"These numbers illustrate the rule; the real ones are on the live dashboard, which I'll show later."
→ *Hand over to Uriel for the cell.*

## Slide 16 — How it works · The cart in 3D  (6 steps)  *(with Uriel)*

"Here is the cart working, step by step, in the 3D model from our build guide."
**1. End guide:** "In the last 24 centimeters, two printed guides catch the fixture's keel even if it arrives up to 12 millimeters off, leaving 1 millimeter per side."
**[→] 2. Loading with the belt running:** "The fixture rides the belt, drops flat onto the stack, and the pusher pulls it in about 7.6 centimeters."
**[→] 3. Load up to 6:** "One at a time. The PLC releases the next fixture only when the cart reports ready, until the tower holds six."
**[→] 4. Trip to the unload station:** "The cart leaves the belt and navigates by waypoints. The ESP32 counts wheel turns and brakes by itself if a sensor sees something under 40 centimeters."
**[→] 5. Unload:** "On arrival the elevator homes, then rises in counted steps until the top fixture sits at the window."
**[→] 6. The pusher:** "The pusher advances 25 centimeters and returns; the fixture slides out onto the table."
**[→] 7. Repeat:** "The platform rises one more level and the pusher removes the next, until the tower is empty. Then the cart returns to the belt."
→ *Hand over to Emmanuel and Pedro for testing.*

## Slide 24 — Testing · Automated tests  *(with Uriel)*

"Everything is tested automatically on the laptop. The server, agents, cell and voice: 361 of 363 tests pass. The cart simulator in Python: 29 of 29. The simulator core in JavaScript: 5 of 5."
"We also check important cases: a full belt-to-table round trip in the simulator passes; if the A and B wires are crossed, the cart must not move, and it doesn't; and the emergency stop interrupts the mission and reports it."
"To be honest, two tests of Lumina's free-chat replies are failing, and they are under review."
→ *Hand over to Isaac.*

## Slide 28 — Interface

"One interface for the whole line. On the left, the cell operator screen. In the middle, the declared inventory. On the right, Lumina, the voice assistant. All three run in the browser from the same server."

## Slide 29 — Assistant · Lumina works offline

"Lumina works without internet, which matters in a classroom or a plant."
"She hears: Vosk recognizes speech on the laptop, in Spanish or English, and the audio is neither saved nor sent out."
"She speaks: with an ElevenLabs voice when there is internet, and with Windows voices when there is not."
"She answers: commands run without a language model, and free questions go to a local model, Ollama."

## Slide 30 — Interconnections: how the devices talk  *(with Emmanuel)*

"This is how the devices talk. The laptop is the server: FastAPI, SQLite, the dashboard, and Lumina with Ollama and Vosk."
"On the left, the manufacturing cell: a Raspberry Pi 4 with a USB camera decides PASS or FAIL and drives GPIO 8 and 9. Through isolated relays it controls the LOGO! PLC, which runs the belt motor, the piston valve and the infrared presence sensor."
"On the right, the cart: a Jetson Orin Nano Super with the camera, YOLO and ArUco, on port 8001, sends observations to the laptop over the local network. Over USB it commands the ESP32, which drives steppers, servo and sensors and has a one-second safety watchdog, and the wheel motors talk over RS485."

## Slide 31 — Control · ESP32: the ESP32 obeys, the Jetson decides

"The Jetson decides and the ESP32 obeys. The Jetson sends simple orders: DRV to drive a straight stretch, TRN to turn to a heading, APR to approach and dock at a station, MAN for manual wheel speeds, and STOP or heartbeat."
"The ESP32 reports back: odometry, motors, distances, battery and stop, and events such as done, blocked or fault."
"Two safety rules live in the ESP32, not in the Jetson: a reflex that brakes by itself under 40 centimeters, and a one-second watchdog that stops everything if the Jetson goes silent. Top speed is 0.35 meters per second."

## Slide 32 — Control · Jetson: one mission, from the simulator to the real cart

"We run one mission, from the belt to the unload table and back, with the 40-centimeter reflex active."
"It is the same program: `mision.py` on the Jetson sends each stretch, and the ESP32 executes it and reports when it ends. It is the same protocol: the simulator speaks the cart's USB lines, so nothing changes on the real cart."
"Five obstacle cases pass in simulation: a box that stays, a person who leaves, a person who crosses, a person at the dock, and a box behind."

## Slide 33 — Control · Jetson: programming the cart in Python

"The cart can be programmed in Python. In the editor you write, save and run against the simulator."
"The functions are simple: avanzar, retroceder, girar_a, ir_a, acoplar, distancia and decir. The same file runs on the simulator and, from the Jetson, on the real cart."
"And safety stays in the ESP32: a program cannot turn off the 40-centimeter reflex or the one-second watchdog."
→ *Hand over to Uriel for the simulation.*

## Slide 42 — Real-time demo: declared inventory from the server

"Finally, a live demo. This is the declared inventory, served by our own backend right now: 51 products, each traceable to the observations behind it. Nothing here is a screenshot."
→ *Hand over to Isaac for next steps.*

---

### Things to check before you speak
- Slide 12: the barcode and ArUco ID are examples, say so (the script does).
- Slide 13: the counters are an illustration of the rule.
- Slide 24: say the two failing tests out loud, as the slide does.
- The live inventory (slide 42) needs the backend running; the simulator slide (41) needs the simulator on port 8770.
