# Generative UI — Project Brainstorming

## References

- https://generativeui.github.io/static/pdfs/paper.pdf
- https://medium.com/@knbrahmbhatt_4883/generative-ui-the-ai-powered-future-of-user-interfaces-920074f32f33
- https://uxplanet.org/the-end-of-the-user-interface-31a787c3ae94

---

## The End of the Traditional UI

The interface is becoming less visual and more abstract. Instead of a screen full of buttons, the "interface" may be:

- **The Conversation:** Dialogue — whether text or voice — becomes the main medium of interaction. Designing a good conversational interface requires clarity, persona definition, context management, and handling ambiguity.
- **The Set of Capabilities:** An agent's "UI" is defined by what it can do. User experience is determined by the breadth, reliability, and intelligence of the agent's actions.
- **Trust:** In a delegation model, trust is the most critical interface component. Users must trust that the agent will understand their intent and act in their best interest. Designing for trust becomes central.
- **Feedback:** How the agent communicates progress, confirms actions, and presents results is itself a form of interface. It may be a subtle notification, a verbal summary, or an on-demand data visualization.

---

## Plan

### Storing User Context

First, figure out how context about a person can be stored and remembered. This can be:

- Past search history
- Things they've clicked and spent lots of time on
- Things they've prompted that they want to see in the past
- Depth of interaction — do they tend to spend lots of time exploring or just get quick hits
  - **ESPN:** Do they just check Lacrosse scores every two days?
  - **Amazon:** Do they click around to discover gift ideas or always just have one thing they want to buy and search it up and click the first one?

There's a way this context is already kind of done in ChatGPT where it remembers things about you and your goals, but that just shapes the text answers, not the style of the answers or interface or suggestions really. Do some research about how preferences are stored.

Maybe interview a couple people and see how they use the apps ESPN or Amazon. I can see what they actually are looking for vs what is in the UI that they don't need.

### Core Philosophy

For Gen UI websites, they should all start with a state of "everything", then as the user uses the site and preferences are learned, info is abstracted.

Looking at myself using Amazon, I will never use the menu items of Today's Deals, Sell, Smart Home, etc. If I'm looking at books I'll click the Books tab, but I know I'll never be looking for books on Photography or Fantasy fiction. And if I do want that I can always ask. It's not like I'll forget those things exist. And a LLM can suggest things out of my wheelhouse randomly despite me having specific preferences for "exploratory" purposes. Even for ESPN, it can give sports preferences then each day have one interesting thing out of my preferences to add.

### Technical Approach

Design this with an app that starts from scratch, with preference data stored in a text file that can be appended to. It's a running text file that gets added to every time a user puts in a search term or clicks something. For ESPN, every component on the screen has a label. If a user clicks something, it says:

```
CLICKED: NCAA Men's Lacrosse
CLICKED: Cornell vs Penn State 5/13
```

If they search something it adds:

```
PROMPTED: Masters betting odds
```

To do this I'll need to create a Firebase database that stores all clicks and prompts in a database file for the person. Then the app needs to use that context in every new prompt to the LLM. Maybe the prompt to the LLM can be something like:

> "Give me a feed of all sports games that are championships this week"

...and then it becomes:

> "A sports user has asked 'Give me a feed of all sports games….' Take these previous preferences into account. CLICKED means the user has clicked this in the past, and PROMPTED means the user has already previously prompted to see this sports information. Here's their preferences: '.....'".

Or if they are just refreshing their website (e.g. opening ESPN or Amazon) have it prompt the AI to give them the website but consider what they've previously clicked or searched to predict what they might want to see.

**Question:** So the entire history of clicks and searches is stored in RAG?

---

## Gemini Experiment

**Test Scenario:** I'm doing an experiment to see how good Gemini can assume UI preferences based on a user's previous clicks and search terms on a site. This is for a Generative UI project.

**Prompt given to Gemini:**

> A user on Amazon has this feed of previous click and search data in order: "SEARCHED: Socks for women, CLICKED: Women casual calf socks, CLICKED: mother's day gifts, SEARCHED: How to win friends and influence people". Knowing this about the user and how Amazon is already set up with its complex UI and menu, what can you assume about the user and their UI preferences, and how would you layout the Amazon UI when they open the Amazon website tomorrow? What would be different from the default Amazon site, what would you add and hide? Don't only look at what they searched and give that back in the UI, since obviously if you search something once it doesn't mean you want to do the same thing on Amazon over and over again. I want you to consider UI design instead.

**Gemini's Response:**

### User Persona & Behavioral Inference

Based on the clickstream, the user is transitioning from Utility/Specific Task (socks) → Exploratory/Gifting (Mother's Day) → Self-Improvement/Intellectual (How to Win Friends).

- **UI Preference:** The user likely appreciates a "Pathfinding" interface. They aren't just "window shopping"; they are solving specific problems (finding a gift, finding a specific book).
- **Cognitive Load:** The jump from "casual socks" to "social psychology literature" suggests a high-intent user who values efficiency over endless scrolling through "Bestsellers."

### The Proposed Generative UI Layout

Shift from the "Infinite Mall" default (cluttered with ads) to a "Personalized Concierge" layout.

**1. The Header & Navigation (What to Hide)**
- **Hide:** The "Keep shopping for..." carousel of socks. They already clicked specific calf socks; showing them 50 more variations creates choice paralysis.
- **Hide:** Generic "Deals" or "Warehouse" tabs that clutter the top navigation.
- **Add:** A "Project-Based" navigation bar. Instead of "Clothing" or "Books," create dynamic categories like "Gifting Progress" and "Learning & Growth."

**2. The Hero Section: "The Contextual Workspace"**
- Instead of a rotating banner of random Amazon Prime shows, the Hero section should be a Mission Control block.
- **Content:** A split-pane view. One side shows "Complete your Mother's Day Gifting" (since they clicked but didn't necessarily buy), and the other shows "Continue your Self-Improvement Journey."
- **UI Difference:** Use a Card-Based Minimalist Design with high white space. Amazon's default UI is "Information Dense"; for a user searching for specific literature and gifts, an "Information Clear" UI reduces friction.

**3. Dynamic "Related Search" Node Map**
- Since the user is looking at *How to Win Friends and Influence People*, the UI should assume they are in "Learning Mode."
- **Add:** A small, interactive Knowledge Graph or "Discovery Map" instead of a linear list.
- **Function:** Visually connect the book to related topics (e.g., Public Speaking, Emotional Intelligence) without making the user type a new search.

**4. The Sidebar: "The Gift Tracker"**
- Since "Mother's Day gifts" was a click, the UI should anticipate the "Deadline" nature of that search.
- **Add:** A persistent (but collapsible) sidebar that tracks the countdown to Mother's Day, featuring a "Quick-Ship" filter for items that will arrive in time.
- **UI Difference:** Shift the "Cart" and "Account" icons to the bottom-right (mobile-friendly thumb zone) and replace their top-right slots with a "Gifting Progress" tracker.

### Summary of Changes

| Element | Default Amazon | Generative UI (Personalized) |
|---|---|---|
| Visual Density | High (Aggressive ads/offers) | Low (Focus on the last 3 intents) |
| Navigation | Department-based | Intent-based (Gifts, Learning, Utility) |
| Search Bar | Empty/General | Pre-filled with "Find more in Self-Improvement?" |
| Promotions | Generic (Prime Video, Music) | Utility (Shipping deadlines for Mother's Day) |

### The "Hidden" Philosophy

The goal is to move from **Predictive Content** (showing more socks) to **Predictive Context** (understanding they are currently in "Prep Mode" for a holiday and "Growth Mode" for themselves). We hide the "noise" of the 90% of Amazon they aren't using right now to make the 10% they need feel like a bespoke application.

---

## Next Steps from Gemini Experiment

This spit out a good response about assuming the user persona and what they might want to see in a feed. But then it needs to be turned into actual UI code with real data. So this response needs to then be fed back into the LLM with a design system for the site (either Figma components, CSS specifications, more general color and feel specs), so that all these ideas for the UI can be converted into real frontend code, then shown up on the screen.

---

## Project Overview / Thesis

I'm interested in exploring the concept of Generative UI, which many designers argue is the future of app and web experiences. Currently it's very common for AI chatbots to use user context to shape the text output in a conversation. Similarly, websites and apps use user preferences to have Suggestions and ranking of content on a page. However, the context of who a user is, what they want to see, and the complexity of the information they'd like to be shown can be reflected in a personalized UI as well.

To use an example, when any user opens the Amazon website, they get the same user interface as everyone else since developers coded and specifically placed each component to allow all users to be able to search/discover all that Amazon has to offer. What if the entire user interface of Amazon was generated by an LLM that knows your online shopping style, products you like, menu items you click and never click, and whether you prefer to see a UI that is simple or complex?

I'm hoping to explore the use cases for Generative UI, and look at the flow needed to have an LLM take in user context and spit out a personalized UI with specifications for design systems and data that can be used on a site. If time permits, I'm planning to use techniques from class to make a prototype of an e-commerce or sports media site.

---

## Sample Prompt Test (Masters Betting)

> Give me everything I need to know about the Masters as someone betting. I want to know live updates, who has won a lot recently, the recent scores to golf events, odds of people, and important news and comparisons.
