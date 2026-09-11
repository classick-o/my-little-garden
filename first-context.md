# 🌿 Plant Companion — Project Context

> **This document is the source of truth for the Plant Companion project.**
>
> Claude Code must read and understand this document before implementing or modifying any feature.
>
> Do not make architectural, UX, database, AI, or design decisions that conflict with this document unless explicitly instructed by the project owner.

---

# 1. Product Overview

Plant Companion is a **mobile-first Progressive Web App (PWA)** designed for people who love plants.

The application combines:

* personal plant management
* plant care tracking
* watering reminders
* plant photography
* plant journaling
* AI-powered plant identification
* AI-powered plant care advice
* contextual AI chat
* plant discovery
* a personal discovery collection
* achievements
* lightweight gamification
* long-term plant history

The application should feel like:

> **A beautiful digital garden + personal plant journal + AI gardening companion.**

It should NOT feel like:

> A generic CRUD dashboard for plants.

The emotional goal is to make the user feel that they are building and caring for a **personal digital garden** over time.

---

# 2. Product Philosophy

The product should prioritize:

1. Beauty
2. Simplicity
3. Smooth interactions
4. Personalization
5. Useful information
6. Fast interactions
7. Long-term engagement

The user should be able to open the app and immediately understand:

> **What is happening with my garden today?**

The application should answer questions such as:

* Which plants need attention?
* When did I last water this plant?
* How is this plant doing?
* What have I done with this plant recently?
* What have I learned about this plant?
* What plants have I discovered?
* Can AI help me understand a problem?

---

# 3. Target Platform

Primary target:

* iPhone
* especially iPhone 13 Pro Max
* Safari
* installed PWA / Add to Home Screen

Secondary targets:

* Android mobile browsers
* tablet
* desktop browsers

The application must be **mobile-first**.

Do NOT design a desktop dashboard and then shrink it for mobile.

The primary design viewport should be approximately:

* 390–430px width

The application must still scale gracefully to larger screens.

---

# 4. Technology Stack

## Frontend

Flutter Web.

Flutter should be used for:

* UI
* navigation
* animations
* state management
* local UI state
* image handling
* API communication

---

## Hosting

Vercel.

Flutter Web production builds will be deployed to Vercel.

---

## Backend

Supabase.

Use Supabase for:

* PostgreSQL
* Authentication
* Google OAuth
* Storage
* Row Level Security
* Edge Functions
* server-side AI integration where appropriate

---

## Authentication

Primary authentication:

**Google OAuth**

The user should be able to log in with:

> Continue with Google

Authentication must be implemented through Supabase Auth.

---

## AI

Initial AI provider:

**Gemini API**

Initial goal:

* use Gemini free tier where possible
* minimize unnecessary token usage
* minimize unnecessary image payload size
* isolate AI logic from the rest of the application

The application must NOT directly expose Gemini API credentials in the Flutter client.

Preferred architecture:

```text
Flutter
   ↓
Supabase Edge Function
   ↓
Gemini API
   ↓
Validation / normalization
   ↓
Supabase
   ↓
Flutter
```

---

# 5. AI Abstraction

Do NOT scatter Gemini-specific implementation throughout the application.

Create an abstraction around AI functionality.

Conceptually:

```text
AIService
 ├── identifyPlant()
 ├── analyzePlant()
 ├── chatWithPlant()
 ├── generatePlantFacts()
 ├── generateCareAdvice()
 └── analyzePlantHealth()
```

Gemini-specific code should live behind this abstraction.

The system should allow changing AI providers in the future without rewriting the application.

---

# 6. Visual Design Direction

The UI should feel:

* calm
* organic
* premium
* warm
* modern
* elegant
* lightweight
* tactile
* friendly

The application should feel closer to:

* Apple Health
* modern journaling applications
* premium lifestyle applications
* beautiful gardening products

and NOT like:

* enterprise dashboards
* generic Material UI
* administrative CRUD applications

---

# 7. Visual Language

Use:

* warm off-white backgrounds
* subtle natural greens
* muted natural colors
* large plant photography
* large rounded cards
* subtle shadows
* restrained borders
* elegant typography
* generous whitespace
* simple iconography

Do not use green for every component.

The visual identity should feel natural without becoming visually saturated.

---

# 8. UI Principles

## Principle 1 — Mobile first

Everything must be comfortable to use with one hand.

---

## Principle 2 — Progressive disclosure

Do not show every possible piece of information immediately.

Show the most important information first.

Example:

```text
Monstera

🌿 Healthy

💧 Watered 3 days ago

Next watering
in approximately 4 days
```

Additional information can appear further down.

---

## Principle 3 — Visual hierarchy

Photos and primary actions should have strong visual hierarchy.

---

## Principle 4 — Minimal cognitive load

The user should rarely need to think:

> "What do I do here?"

---

## Principle 5 — Micro-interactions matter

Actions should provide visual feedback.

---

# 9. Animation Philosophy

Animations should feel:

> **physical, natural, and intentional.**

They should NOT feel:

* excessive
* childish
* slow
* decorative for no reason

Preferred animation duration:

```text
150–350ms
```

depending on interaction.

Preferred animation styles:

* fade
* scale
* spring
* slide
* subtle parallax
* hero/shared-element transitions
* progress animations

Avoid:

* excessive bouncing
* long transitions
* constant movement
* animations that interfere with usability

---

# 10. PWA Requirements

The application should behave as a proper PWA.

Support:

* web app manifest
* app icon
* splash screen
* appropriate theme colors
* safe-area handling
* mobile viewport configuration
* install-to-home-screen experience
* responsive layout
* offline-friendly caching where practical

The installed experience should feel as close as possible to a native iOS application.

---

# 11. Main Navigation

Initial navigation should contain four primary areas:

```text
🌱 Garden
✨ Discover
📖 Journal
🤖 AI
```

There should also be a prominent way to:

```text
+ Add Plant
```

This can be implemented as:

* floating action button
* central navigation action
* prominent contextual action

depending on the final UI.

---

# 12. Garden

The Garden is the primary home screen.

Its purpose is to answer:

> "How is my garden doing right now?"

Possible structure:

```text
Good evening 🌿

Your little garden
12 plants

[ Featured plant ]

Needs attention

[ Plant ] [ Plant ]

Recently cared for

[ Plant ] [ Plant ]
```

The page should not become a statistics dashboard.

Prioritize:

* plants
* care status
* actions
* visual beauty

---

# 13. Garden Intelligence

The home screen should surface useful information.

Examples:

```text
🌱 2 plants may need attention

💧 1 plant is due for watering

🌿 8 plants are on track
```

The system should eventually intelligently determine what deserves attention.

The user should not need to inspect every plant manually.

---

# 14. Plant Entity

A personal plant represents a plant the user owns or takes care of.

Conceptual model:

```text
Plant
 ├── id
 ├── user_id
 ├── name
 ├── species
 ├── nickname
 ├── description
 ├── image_url
 ├── thumbnail_url
 ├── location
 ├── sunlight
 ├── watering_frequency
 ├── last_watered_at
 ├── next_watering_at
 ├── created_at
 └── updated_at
```

The schema may evolve.

Do not rigidly encode every possible plant attribute before there is a product requirement for it.

---

# 15. Plant Naming

Every plant can have a user-facing name.

Example:

```text
Name:
Luna

Species:
Monstera deliciosa
```

The personal name and scientific/common plant species are separate concepts.

---

# 16. Plant Detail Screen

The Plant Detail screen should be one of the most visually polished screens in the application.

Conceptual structure:

```text
←                         ⋯

          [ LARGE PHOTO ]

             Luna
      Monstera deliciosa

           🌿 Healthy

─────────────────────────

CARE

💧 Water
Every 7–10 days

☀️ Light
Bright indirect

🌡 Temperature
18–28°C

💨 Humidity
Medium–high

─────────────────────────

Recent activity

💧 Watered 3 days ago
📸 New photo
🤖 AI analysis
```

The exact layout may evolve.

---

# 17. Watering

Watering is a primary interaction.

The user should see:

```text
💧 Watered 3 days ago

Next watering
in approximately 4 days
```

Primary action:

```text
Water plant
```

When pressed:

1. save watering event
2. update `last_watered_at`
3. calculate/update `next_watering_at`
4. update UI immediately
5. create journal event
6. update achievement progress
7. show subtle animation

---

# 18. Watering Animation

Watering should have a small delightful interaction.

Concept:

```text
Water plant
     ↓
water ripple
     ↓
plant interaction
     ↓
"Nice. Luna is happy."
```

The animation should be subtle and fast.

Do not create a large gamified animation every time the user waters a plant.

---

# 19. Plant Events

Plant history should be event-based.

Use a general event model rather than creating a separate table for every possible action.

Conceptual:

```text
plant_events
```

with event types such as:

```text
created
watered
photo_added
note_added
fertilized
repotted
pruned
moved
ai_analysis
```

Example:

```json
{
  "type": "watered",
  "plant_id": "...",
  "created_at": "...",
  "metadata": {}
}
```

This event architecture should support the Journal and future features.

---

# 20. Journal

The Journal is a chronological timeline of the user's plant-related activity.

Example:

```text
March 18

💧 Luna was watered


March 15

📸 New photo added


March 12

🤖 Asked AI:
"Why are Luna's leaves curling?"


March 8

💧 Luna was watered


March 1

🌱 Luna was added
```

The Journal should feel like a personal history rather than a database log.

---

# 21. Plant Photos

Each plant can have multiple photos.

Conceptual model:

```text
PlantPhoto
 ├── id
 ├── plant_id
 ├── original_url
 ├── processed_url
 ├── thumbnail_url
 ├── created_at
 └── ai_analysis
```

Photos should form a visual timeline.

Example:

```text
March

[ photo ] [ photo ]

February

[ photo ]
```

This allows the user to see how the plant changes over time.

---

# 22. Image Optimization

Never unnecessarily send original high-resolution phone photos to AI.

Example phone photo:

```text
4032 × 3024
```

should be resized/compressed before AI analysis.

AI input can target approximately:

```text
max dimension ≈ 1024px
```

with reasonable compression.

The exact size/quality should be optimized based on actual AI performance.

Goals:

* reduce request size
* reduce latency
* reduce token/image processing cost
* preserve enough detail for plant identification

---

# 23. Image Storage Pipeline

Preferred pipeline:

```text
Camera
   ↓
Original image
   ↓
Local resize/compression
   ↓
AI-optimized image
   ↓
Gemini
   ↓
AI result
   ↓
background image processing
   ↓
Storage variants
```

Storage should eventually contain optimized variants such as:

```text
thumbnail
medium
full
```

Avoid storing unnecessary massive files.

---

# 24. AI Plant Identification

When the user takes a picture of a plant:

```text
Take photo
    ↓
local image optimization
    ↓
Gemini
    ↓
plant identification
    ↓
structured result
```

Expected conceptual response:

```json
{
  "common_name": "Monstera",
  "scientific_name": "Monstera deliciosa",
  "confidence": 0.94,
  "care": {
    "light": "Bright indirect light",
    "watering": "Every 7–10 days",
    "humidity": "Medium to high"
  },
  "interesting_facts": [
    "...",
    "...",
    "..."
  ]
}
```

The exact schema may evolve.

---

# 25. Structured AI Responses

Important AI outputs must be structured.

Do NOT depend on parsing arbitrary prose.

Prefer:

```text
JSON schema
    ↓
validation
    ↓
normalized domain model
```

AI output should be validated before being stored or displayed.

---

# 26. AI Confidence

Plant identification should support uncertainty.

AI should not always claim certainty.

Possible states:

```text
high confidence
medium confidence
low confidence
```

If uncertain:

```text
I'm not completely sure, but this looks most like...
```

The AI must never fabricate certainty.

---

# 27. AI Chat

AI Chat is a major feature.

It should NOT feel like a generic ChatGPT clone.

It should feel like:

> **your garden assistant.**

---

# 28. Plant-Specific AI Chat

When the user opens AI from a specific plant, the AI receives contextual information.

Example context:

```text
Plant:
Luna

Species:
Monstera deliciosa

Last watered:
3 days ago

Watering frequency:
7–10 days

Light:
Bright indirect

Location:
Living room

Recent events:
...

Recent photos:
...

Previous observations:
...
```

The AI can then answer contextually.

Example:

User:

> Does she need water?

AI:

> Based on Luna's recent watering history, I'd probably wait a little longer before watering her.

This is much more valuable than generic plant advice.

---

# 29. AI Suggested Questions

When opening plant chat, show suggested questions.

Examples:

```text
Does she need water?

Why are her leaves turning yellow?

Is she getting enough light?

Tell me something interesting about her.
```

These make the chat feel useful immediately.

---

# 30. Global AI

The global AI assistant can answer questions about the entire garden.

Examples:

```text
Which of my plants needs attention today?

Which plants haven't been watered recently?

Why are several of my plants developing yellow leaves?

Which plant would be happiest near my window?

Tell me something interesting about my garden.
```

The AI receives a summarized representation of the user's plants.

Do not blindly send the entire database to every AI request.

Build a contextual summary.

---

# 31. AI Context Strategy

AI context should be carefully controlled.

Do not send:

* unnecessary database fields
* unnecessary historical events
* unnecessary images
* entire chat histories when not required

Prefer:

```text
current plant state
+
relevant recent events
+
relevant observations
+
relevant previous AI context
```

Context should be intentionally constructed.

---

# 32. AI Memory

Long-term AI memory is a future feature.

Eventually the AI could understand:

```text
Luna
- owned for 183 days
- watered 24 times
- 7 photos
- 3 AI conversations
- moved once
- recent new leaf
```

Then it could say:

> "Luna seems to be doing better since you moved her closer to the window."

This is a key long-term product direction.

---

# 33. AI Personality

AI tone should be:

* knowledgeable
* warm
* calm
* helpful
* slightly playful
* not childish
* not corporate

Examples:

```text
Luna looks pretty happy overall 🌿

I'd hold off on watering her today.

That yellow leaf isn't necessarily a disaster.
```

Avoid:

```text
OMG!!! 🌱🌱🌱 YOUR PLANT IS SOOOO HAPPY!!!
```

Avoid corporate language.

---

# 34. AI Safety / Reliability

AI must not present uncertain information as fact.

For plant health:

Avoid:

```text
Your plant definitely has disease X.
```

Prefer:

```text
This could be consistent with X, but there are several possible causes.
```

When appropriate, distinguish:

```text
likely
possible
uncertain
```

AI advice should be practical but cautious.

---

# 35. Discovery

Discovery is a separate concept from personal plants.

A user can see a plant somewhere and identify it without owning it.

Example scenario:

```text
User sees beautiful plant
       ↓
Open Discover
       ↓
Take photo
       ↓
AI identifies it
       ↓
Interesting facts
       ↓
Save to discoveries
```

---

# 36. Discovery Result

Example:

```text
✨ We found it!

Bird of Paradise

Strelitzia reginae

────────────────────

🌿 Tropical

☀️ Loves bright light

💧 Moderate watering

────────────────────

Interesting facts

• Native to South Africa
• Flowers resemble a bird
• Can grow several meters tall

[ Add to discoveries ]
```

---

# 37. Discovery Collection

The user should have a collection of plants they have discovered.

Example:

```text
My discoveries

42 plants discovered

[ Monstera ]
[ Aloe Vera ]
[ Bird of Paradise ]
[ Areca Palm ]
```

Discovery does NOT mean ownership.

---

# 38. Discovery Data Model

Conceptual:

```text
PlantDiscovery
 ├── id
 ├── user_id
 ├── name
 ├── scientific_name
 ├── image
 ├── location
 ├── discovered_at
 ├── facts
 └── ai_identification
```

Location can be optional.

---

# 39. Future Discovery Map

Potential V2 feature:

```text
Plant discoveries

Romania
 ├── Monstera
 ├── Lavender

Italy
 ├── Olive tree
 ├── Bougainvillea

Greece
 ├── ...
```

This can eventually become a:

> **Plant Passport**

showing plants discovered around the world.

Do not implement this in V1 unless explicitly requested.

---

# 40. Achievements

Gamification should be subtle.

Achievements should feel like little moments of delight.

Examples:

```text
🌱 First Leaf
Added your first plant.

💧 Hydration Hero
Watered plants 10 times.

🌿 Growing Together
Kept a plant for 30 days.

🔎 Curious Gardener
Discovered 10 plants.

📸 Plant Photographer
Added 20 plant photos.

🤖 AI Gardener
Asked AI 10 questions.

🌎 Explorer
Discovered plants in 3 locations.

🌳 Green Thumb
Maintained 5 healthy plants for 30 days.
```

---

# 41. Achievement Architecture

Do not hardcode achievement logic inside widgets.

Conceptual model:

```text
Achievement
 ├── id
 ├── code
 ├── title
 ├── description
 ├── icon
 ├── requirement_type
 └── requirement_value
```

Example:

```text
code:
DISCOVER_10

requirement_type:
discoveries_count

requirement_value:
10
```

User progress:

```text
user_achievements
```

The achievement engine should be extensible.

---

# 42. XP / Garden Level

A lightweight progression system may exist.

Example:

```text
Garden Level

Level 7

████████░░

342 points
```

Possible activities:

```text
Add plant       +20
Water plant      +5
Add photo       +10
Discovery       +15
AI interaction   +5
Care streak     +30
```

XP should remain secondary.

The application must never feel like a mobile game.

---

# 43. Notifications

Future feature.

Possible notification:

```text
💧 Luna might be thirsty
```

Avoid notification spam.

Potential future concept:

```text
Morning Garden Summary

🌿 2 plants need attention
💧 1 plant is due for watering
```

Do not implement push notifications until the core product is stable.

---

# 44. Add Plant Flow

The user should have two primary ways to add a plant.

## Manual

```text
Plant name
Species
Photo
Location
Light
Watering schedule
```

---

## AI-assisted

```text
Take a photo
      ↓
AI identifies plant
      ↓
Monstera deliciosa
      ↓
User confirms
      ↓
User chooses personal name
      ↓
Plant created
```

The AI must assist, not force the user to accept its identification.

---

# 45. Plant Notes

Users should be able to write personal observations.

Examples:

```text
Moved Luna closer to the window.

New leaf appeared today!

Leaves looked slightly droopy this morning.
```

Notes become journal events.

Relevant notes may later be included in AI context.

---

# 46. Plant Health

Potential status values:

```text
🌿 Thriving
🙂 Healthy
💧 Needs water
⚠️ Needs attention
```

Health status should not be fabricated by AI.

It can be derived from:

* watering schedule
* recent events
* user observations
* AI analysis
* plant-specific care requirements

---

# 47. Long-Term Plant Story

The application should eventually create a sense of history.

After several months:

```text
Luna

Owned for 184 days

💧 24 watering events
📸 18 memories
🤖 6 AI conversations

Last new leaf:
12 days ago
```

This should feel like a story of the plant, not a database report.

---

# 48. Empty States

Empty states are part of the product design.

Do not use:

```text
No data found.
```

Use contextual empty states.

Example:

```text
Your garden is waiting 🌱

Start with your first plant.

[ Add your first plant ]
```

Discovery:

```text
Nothing discovered yet.

Next time a plant catches your eye,
take a photo.

[ Discover a plant ]
```

---

# 49. Onboarding

Onboarding should be short.

Do not create an 8-step onboarding flow.

Concept:

```text
Welcome to your garden 🌿

A little space for
the plants you love.

[ Continue with Google ]
```

After authentication:

```text
What should we call your garden?

[ ... ]
```

Then:

```text
Let's add your first plant.

[ Add plant ]

Maybe later
```

---

# 50. Database Architecture

Initial conceptual tables:

```text
profiles
plants
plant_photos
plant_events
plant_ai_analysis
plant_discoveries
chat_conversations
chat_messages
achievements
user_achievements
```

The schema may evolve.

Do not create unnecessary tables.

---

# 51. Database Security

Supabase Row Level Security must be enabled.

Users must only access their own data.

Conceptually:

```text
User A
  ↓
can access
  ↓
User A's plants

User B
  ↓
cannot access
  ↓
User A's plants
```

This applies to:

* plants
* photos
* events
* discoveries
* chats
* achievements
* profile data

Never rely on Flutter-side filtering for security.

---

# 52. Storage Security

Plant images must be securely associated with the authenticated user.

Do not expose private user content unnecessarily.

Use appropriate Supabase Storage policies.

---

# 53. Chat Architecture

Conceptual:

```text
chat_conversations
 ├── id
 ├── user_id
 ├── plant_id (nullable)
 ├── title
 ├── created_at
 └── updated_at
```

Messages:

```text
chat_messages
 ├── id
 ├── conversation_id
 ├── role
 ├── content
 ├── metadata
 └── created_at
```

Roles:

```text
user
assistant
```

Potential future role:

```text
system
```

---

# 54. AI Analysis Storage

Plant AI analyses should be stored separately from plants.

Conceptual:

```text
plant_ai_analysis
 ├── id
 ├── plant_id
 ├── photo_id
 ├── analysis_type
 ├── result
 ├── confidence
 ├── model
 ├── prompt_version
 └── created_at
```

This makes AI history auditable and allows future model improvements.

---

# 55. AI Prompt Versioning

Prompts must be versioned.

Conceptual:

```text
plant_identification_v1
plant_analysis_v1
plant_chat_v1
discovery_v1
```

Do not put large prompts directly into random Dart widgets.

Prompts should be centralized.

---

# 56. Flutter Architecture

Recommended conceptual structure:

```text
lib/
│
├── core/
│   ├── theme/
│   ├── routing/
│   ├── networking/
│   ├── storage/
│   ├── animations/
│   └── widgets/
│
├── features/
│   ├── auth/
│   ├── garden/
│   ├── plants/
│   ├── discoveries/
│   ├── journal/
│   ├── ai/
│   ├── achievements/
│   └── profile/
│
├── models/
│
├── repositories/
│
└── services/
    ├── ai/
    ├── image/
    └── analytics/
```

The exact architecture can evolve.

The key principle is separation of concerns.

---

# 57. Layering

Preferred flow:

```text
UI
 ↓
State / Controller
 ↓
Repository
 ↓
Supabase
```

For AI:

```text
UI
 ↓
AI controller
 ↓
AI repository/service
 ↓
Supabase Edge Function
 ↓
Gemini
```

Do NOT do this:

```text
Widget
 ↓
Supabase query
 ↓
business logic
 ↓
JSON parsing
 ↓
UI
```

---

# 58. State Management

Choose one consistent state-management solution.

Do not introduce multiple competing state-management patterns.

Once the project starts, keep the chosen pattern consistent.

Claude Code must inspect the existing codebase before introducing a new pattern.

---

# 59. Design System

Create a reusable design system.

Conceptual:

```text
AppColors
AppTypography
AppSpacing
AppRadius
AppShadows
AppAnimations
```

Reusable components:

```text
PlantCard
PlantPhoto
CareMetric
PrimaryButton
SecondaryButton
GlassCard
SectionHeader
EmptyState
AchievementBadge
AIMessageBubble
JournalEvent
```

Avoid one-off visual implementations when a reusable component should exist.

---

# 60. Image Components

Images are a major part of the application.

Image components should support:

* thumbnail
* medium
* full
* loading state
* error state
* smooth fade-in
* caching
* rounded clipping
* appropriate aspect ratios

Never load unnecessarily large images into small cards.

---

# 61. Performance

Performance is a first-class requirement.

Prioritize:

* lazy loading
* image optimization
* image caching
* efficient database queries
* pagination where necessary
* avoiding unnecessary rebuilds
* lightweight animations
* skeleton loading
* optimistic UI where appropriate

Avoid:

* huge image payloads
* unnecessary database requests
* loading all plant history at once
* rebuilding the entire page for small state changes

---

# 62. Loading States

Prefer:

```text
skeleton
```

over:

```text
spinner
```

when loading content.

Examples:

```text
Plant card skeleton
Photo skeleton
AI response skeleton
Journal skeleton
```

Use spinners only where appropriate.

---

# 63. Optimistic UI

For fast local interactions such as watering:

```text
User taps Water
       ↓
UI updates immediately
       ↓
backend request
       ↓
success
```

If the request fails:

```text
rollback
+
show useful error
```

Do not make the user wait unnecessarily for obvious interactions.

---

# 64. Error Handling

Errors should be human-readable.

Avoid:

```text
Exception: PostgrestException code 42501
```

Prefer:

```text
Something went wrong while saving this.

Please try again.
```

For AI:

```text
I couldn't identify this plant confidently.

Try taking a clearer photo with the leaves visible.
```

---

# 65. Networking

All backend communication should be centralized.

Do not directly perform HTTP requests from UI widgets.

---

# 66. Environment Variables

Never commit:

* API keys
* service-role keys
* secrets
* private credentials

Client-safe configuration may use environment variables as appropriate.

Supabase service-role credentials must remain server-side.

Gemini credentials must remain server-side.

---

# 67. Supabase Edge Functions

Use Edge Functions for operations that require secrets or server-side control.

Examples:

```text
identify-plant
analyze-plant
plant-chat
discover-plant
```

The exact naming may evolve.

---

# 68. AI Rate Limiting

AI usage must eventually be protected from abuse.

Consider:

* authenticated-only AI access
* per-user rate limits
* request size limits
* image size limits
* conversation length limits
* server-side validation

Do not allow unlimited uncontrolled AI requests.

---

# 69. AI Cost Optimization

Always consider token and image-processing cost.

Before sending an AI request:

1. minimize image size
2. minimize prompt size
3. send only relevant context
4. avoid repeating unnecessary information
5. avoid sending complete histories
6. cache reusable AI information

Do not call AI if the result can be computed locally.

Example:

Determining:

```text
last watered 3 days ago
```

does NOT require AI.

---

# 70. Local vs AI Logic

Use deterministic application logic for:

* watering calculations
* dates
* event creation
* achievement counters
* user preferences
* filtering
* sorting
* basic plant status

Use AI for:

* identification
* interpretation
* natural-language advice
* image analysis
* discovery facts
* conversational assistance

Do not use AI for things that normal code can reliably calculate.

---

# 71. Analytics

Analytics should be considered later.

Potential events:

```text
plant_created
plant_watered
photo_added
ai_identification
ai_chat_started
discovery_created
achievement_unlocked
```

Analytics must respect privacy requirements.

Do not add unnecessary tracking in V1.

---

# 72. V1 Scope

The first production-quality version should focus on:

```text
Google Login
        ↓
Garden
        ↓
Add Plant
        ↓
Plant Details
        ↓
Watering
        ↓
Photos
        ↓
Basic Journal
        ↓
AI Plant Identification
```

The initial version should be polished rather than huge.

---

# 73. V1.5

After the core experience is stable:

```text
AI Chat
AI Plant Analysis
Achievements
Discovery
Discovery Collection
```

---

# 74. V2

Potential future features:

```text
Advanced AI memory
Plant timeline
Discovery map
Smart notifications
Plant health trends
Garden statistics
Advanced gamification
Plant Passport
```

Do not implement future features prematurely.

---

# 75. Primary User Journey — Care

Example:

```text
Open app
    ↓
Good evening 🌿
    ↓
See garden
    ↓
"Luna needs water"
    ↓
Tap Water
    ↓
Subtle water animation
    ↓
Watering saved
    ↓
Achievement progress updated
    ↓
Continue browsing
```

This should feel fast and satisfying.

---

# 76. Primary User Journey — Discovery

```text
See beautiful plant
    ↓
Open app
    ↓
Discover
    ↓
Take photo
    ↓
AI identifies plant
    ↓
Interesting facts
    ↓
Save to discoveries
    ↓
"Maybe I'll get one someday 🌱"
```

---

# 77. Primary User Journey — Plant Problem

```text
Notice yellow leaf
    ↓
Open plant
    ↓
Ask AI
    ↓
AI receives:
    - plant species
    - plant history
    - watering history
    - observations
    - relevant photos
    ↓
Personalized response
```

---

# 78. Long-Term Product Vision

After months of usage, the application should contain:

```text
Your Garden

🌿 18 plants
📸 73 memories
🌎 31 discoveries
🏆 12 achievements

You've been growing together
for 184 days.
```

The product should feel like a living personal archive.

---

# 79. Emotional Design

The user should feel:

* calm
* curious
* rewarded
* connected to their plants
* proud of their garden
* excited to discover new plants

The product should encourage care without creating anxiety.

---

# 80. Things We Must Avoid

Do NOT build:

* generic admin dashboard UI
* excessive statistics
* excessive green
* generic Material UI
* AI chat that looks exactly like ChatGPT
* excessive gamification
* spammy notifications
* huge image uploads
* AI API keys in frontend
* business logic inside widgets
* unvalidated AI JSON
* unnecessary AI calls
* massive prompts
* unnecessary database tables
* duplicated design components
* long onboarding
* excessive animations
* slow transitions

---

# 81. Claude Code Rules

Claude Code must follow these rules while working on the project.

## Rule 1

Read `PROJECT_CONTEXT.md` before implementing a new feature.

---

## Rule 2

Inspect the existing architecture before modifying it.

Do not assume the project structure.

---

## Rule 3

Do not introduce a second architectural pattern when an existing pattern already solves the problem.

---

## Rule 4

Do not put business logic inside UI widgets.

---

## Rule 5

Do not put Supabase queries directly inside presentation widgets.

---

## Rule 6

Do not expose secrets in Flutter Web.

---

## Rule 7

Do not expose Gemini credentials to the browser.

---

## Rule 8

Reuse the existing design system.

Before creating a new button/card/component, check whether an existing component can be reused.

---

## Rule 9

Mobile-first always.

Every new screen must be usable at approximately 390px width.

---

## Rule 10

Animations must be subtle and intentional.

---

## Rule 11

Avoid premature abstraction.

Do not create complicated frameworks for simple features.

---

## Rule 12

Avoid premature optimization, but never ignore obvious performance problems such as loading huge images.

---

## Rule 13

Do not silently change database schema.

Database changes must be represented as migrations.

---

## Rule 14

Never bypass Row Level Security as a shortcut.

---

## Rule 15

Do not fabricate AI results.

AI uncertainty must be represented when appropriate.

---

## Rule 16

Use structured AI outputs wherever application logic depends on AI results.

---

## Rule 17

Validate AI output before storing it.

---

## Rule 18

AI context must be intentionally constructed.

Never blindly send entire database records or entire histories.

---

## Rule 19

Do not add future features unless explicitly requested.

Keep V1 focused.

---

## Rule 20

When implementing a feature, consider:

```text
UX
Architecture
Database
Security
Performance
Error handling
Accessibility
Mobile responsiveness
Animations
```

not only the happy-path UI.

---

# 82. Accessibility

The application should support:

* readable text sizes
* sufficient contrast
* large touch targets
* semantic labels
* keyboard navigation where relevant
* reduced motion considerations
* accessible interactive states

Animations should not make the application unusable for users who prefer reduced motion.

---

# 83. Responsive Design

At minimum, support:

```text
Mobile
Tablet
Desktop
```

Mobile remains the primary target.

Desktop should not simply stretch mobile cards indefinitely.

Use appropriate maximum content widths.

---

# 84. Testing

Important business logic should have tests.

At minimum:

* watering calculations
* achievement logic
* AI response parsing
* repository behavior
* authentication flows where practical
* critical UI interactions

Do not rely entirely on manual testing.

---

# 85. Database Migration Philosophy

Every schema change should be represented by a migration.

Never manually modify production schema without a migration.

Migrations should be:

* deterministic
* reviewable
* reversible where practical
* documented when necessary

---

# 86. Development Workflow

Preferred implementation workflow:

```text
Understand requirement
        ↓
Inspect existing code
        ↓
Inspect architecture
        ↓
Define data changes
        ↓
Define UI states
        ↓
Implement backend
        ↓
Implement repository/service
        ↓
Implement state/controller
        ↓
Implement UI
        ↓
Add animations
        ↓
Add error/loading states
        ↓
Test
        ↓
Review for mobile
        ↓
Review performance
```

---

# 87. Feature Completion Checklist

A feature is not complete just because the happy path works.

Before considering a feature complete, check:

```text
[ ] Mobile UI
[ ] Desktop responsiveness
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state
[ ] Accessibility
[ ] Animation
[ ] Performance
[ ] Database security
[ ] RLS
[ ] Validation
[ ] Tests
[ ] Reusable components
[ ] No secrets exposed
```

---

# 88. Product Language

The application should use concise, warm language.

Prefer:

```text
Your garden
Needs attention
Water plant
Discover plant
Ask AI
Add a memory
```

Avoid overly technical or robotic language.

---

# 89. Example UI Copy

Garden:

```text
Good evening 🌿

Your little garden
```

Plant:

```text
Luna looks happy today.
```

Water:

```text
Water plant
```

After watering:

```text
Nice. Luna is happy 🌿
```

Discovery:

```text
What plant caught your eye?
```

AI:

```text
Ask your garden assistant
```

Empty garden:

```text
Your garden is waiting 🌱
```

---

# 90. Product Personality

The product personality is:

```text
Warm
Calm
Knowledgeable
Curious
Elegant
Slightly playful
Personal
```

It is NOT:

```text
Childish
Corporate
Overly technical
Aggressively gamified
Overly cute
```

---

# 91. Final Product Definition

Plant Companion is fundamentally:

> **A personal digital garden that remembers your plants, helps you care for them, lets you discover new ones, and gives you an AI companion that understands the history of your garden.**

The product should become more valuable the longer it is used.

A user should be able to look back after months and see:

* how their plants changed
* when they cared for them
* photos over time
* what they discovered
* what they learned from AI
* achievements they unlocked
* memories associated with their garden

The core loop is:

```text
CARE
 ↓
RECORD
 ↓
LEARN
 ↓
DISCOVER
 ↓
COLLECT
 ↓
GROW
```

The ultimate goal is not to build a plant database.

The goal is to build:

> **a beautiful little digital world around the user's plants.**
