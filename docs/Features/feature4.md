- ui should be relevant with the entire website. as mentioned in `DESIGN.md`

- this should follow the guardrails mentioned in the `docs` folder. 

- inside the home page for the vendor account the navigation bar should show the following things: 
    - manage bookings
    - listings
    - help
    - profile name (it's already there don't have to change anything to it) (just add a functionality to open the settings for that profile when the clicked). 
    

- inside the manage bookings, the vendor should be able to add services of hotel in it. and here's where the geo location setup will be : 

    - in the setting up the geo location for vendor,s add a functionality to pick from the map directly. where it will have it's own serachbar which will search for that particular area, and then there will be a pointer blip that will be used to pin point the lat and longs, now once that happens, there will appear a button once the pointer is stable, that says "save location". and that would extract out the lat and long from that map directly along with the address of that area through that map. directly. 

    after the geo location setup, the next step opens through a proper animation, and that leads to a proper interactive UI of the drag and drop type, where there will be a nice square grid, in this square grid the vendor will be able to click to add a box which will signify a room tier, in that room tier there will appear the services that the vendor can add and set the price of, those services will be : 

    - those services will be : room cleaning, laundry, meal plans (breakfast / half-board / full-board), spa & massage sessions, airport pickup & drop, extra bed / crib add-on, mini-bar restock, Wi-Fi tier upgrades, parking slot booking, pool & gym access passes, and conference / banquet room reservation. each service card inside the room tier box will have a small toggle to enable / disable it, an input field for the price (per night or one-time, selectable via a dropdown), and a short description field so the vendor can clarify what's included.

    - the drag and drop behaviour will let the vendor click any room tier box and drag it to another cell in the grid to reorder or reposition tiers (for example, moving a "Deluxe" tier next to a "Suite" tier visually). while dragging, the box will lift slightly with a soft shadow and the target cell will highlight, and on release the box snaps into place with a smooth easing animation. double-clicking a room tier box will open an inline editor where the vendor can rename the tier, set the base nightly rate, upload a cover image, and toggle availability for specific dates.

    - once all room tiers and services are configured, a floating action button labelled "save setup" will appear at the bottom-right of the screen. clicking it will run a validation check (at least one room tier, valid lat-long, all prices > 0) and on success will show a brief success toast, then redirect the vendor back to the manage bookings overview where the newly created hotel listing now appears as a card with its pinned map location preview.

    - the **listings** tab will show every hotel / property the vendor has created, each as a card displaying the property name, the saved geo-pin preview, number of room tiers, average rating, and a status badge (active / pending / paused). each card will have quick actions: edit, pause, duplicate, or delete. a "create new listing" button at the top will re-enter the same geo-location → grid setup flow described above, so the vendor can onboard multiple properties without leaving the dashboard.

    - the **help** tab will be a clean accordion-style FAQ page grouped into categories: getting started, managing bookings, pricing & services, geo-location setup, and account & billing. each question expands to reveal the answer with small inline illustrations where useful. at the bottom of the help page there will be a "contact support" button that opens a pre-filled form (vendor name, listing id, issue category) which submits to the support queue, and a small chat widget in the corner for live assistance during business hours.

    - the **profile name** in the navbar, when clicked, will open a slide-in panel from the right side of the screen (not a full page reload) containing the vendor's settings. this panel will have sections for: personal info (name, email, phone — editable), business details (company name, tax id, business address, payment setup), notification preferences (email / SMS / in-app toggles for new bookings, cancellations, payout alerts), security (change password, enable 2FA, active sessions list), and a danger zone at the bottom for account deactivation. all changes will auto-save with a subtle "saved" indicator, and a "done" button at the top-right will close the panel and return the vendor to wherever they were.

    - throughout every screen, the design tokens from `DESIGN.md` will be respected: the same colour palette, typography scale, border radii, spacing units, and shadow depths. every new component (room tier box, service card, map picker, slide-in panel) will be built from the existing component library in the `docs` folder so nothing feels visually out of place. all interactive elements will have hover, focus, and active states defined, and every transition (tab switch, panel open, drag drop, geo-pin save) will use the standard easing curve and duration specified in the design system so the whole dashboard feels like one cohesive product rather than stitched-together pages.

    - finally, all data flows will respect the guardrails in the `docs` folder: vendor data is fetched through the existing API hooks, form validation uses the shared schema validators, geo-coordinates are stored normalised to 6 decimal places, and any destructive action (delete listing, deactivate account) requires a confirmation modal with the vendor typing the property name to confirm. this keeps the entire vendor experience consistent, safe, and aligned with the rest of the platform.
