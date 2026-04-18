# PRD

Product name: TBD

Date: 14th Feb 2026

Wireframe: https://www.figma.com/design/9ISHq3i5685WqYxxHujM1x/CS162?node-id=0-1&t=eOqqGqJTeW9fwLEo-1

**Problem statement**

Minerva students frequently rely on informal channels to find mock interview partners.

This results in

1. **Cannot find relevant partners**
   1. similar experience levels, topic-specific interviewers
2. **Scheduling conflict (BIG ISSUE)**
3. Miscommunication about the interview expectation
4. **Low response rate if DM**

**Goal**

A lightweight platform that matches interviewees with relevant interviewers based on (1) Topic, Experience level, Target company, and Time.

**Scope for MVP**

- Matching + structured session setup + optional scheduling

**Target user**

- Any student…? who needs mock partners, clear structure, and fast scheduling

## User story

**MATCHING**

- As an interviewee, I want to select
  - Interview type (technical / behavioral / case / product)
  - Topics
  - Target company (?)
  - Difficulty level
  - Time zone
- So that I get matched with someone relevant.

- As an interviewer, I want to specify
  - Topics I can confidently interview, experience level, availability
- So that I only receive mock requests that works for me

**ALIGNMENT**

- As an interviewee, I want to give information in advanced about
  - Companies I’m preparing for
  - Format
  - Focus area
- So I don’t have to re-explain this each time.

- As an interviewer, I want to see this summary before accepting.
- So I know exactly what to prepare.

**SCHEDULING**

- As a user, I want:
  - Integrated availability matching
  - Automatic time zone conversion
- So we avoid long DM threads.

**FEEDBACK**

- As an interviewer, I want:
  - A structured feedback template
- So feedback is consistent.

—

## MVP Features

**Profile**

- Name, emails, timezone
- Interview type support, Topics
- Availability (?… but do we input this in advance?)

**Matching Engine**

- Required: interview type, topic overlap
- Secondary: time(? — I believe people can work it out)

Output, hard filter on required scopes, score based on others

**Session flow**

- Interviewee submits: type, topics, duration
- Interviewers: yes/no
- Confirmed session appears in the dashboard.
- Post-session: Structured feedback form, written notes
  - all stored in user’s history

## Success Metrics

## MVP User Flow

- Sign up (Minerva email only)
- Complete profile
- Request mock (fill structured form)
- See ranked matches
- Send request
- Interviewer accepts
- Session confirmed
- Feedback form post-session

## Risks

- Not enough users, matches are very rare

---

**Primary Users**

**Problem**

- Matching happens in DMs/group chats → unclear intent, topic, level, and availability → reschedules + low-quality sessions.

**MVP Outcome**

- Structured request + availability → match → confirmed session with auto-created meeting link.

**Core Objects (Data Model)**

- User: role intent, experience level, timezone, calendar prefs
- Post/Request: intent (give/get/both), field, interview type, topics, difficulty, duration, availability windows
- Match: two users + selected slot + status
- Session: datetime, meeting link, notes, feedback (optional)

**MVP Features (Must)**

- Auth: Minerva email/SSO (or email login) + profile (timezone required)
- Create Post: structured form (intent, field, interview type, topics, difficulty, duration, availability)
- Browse/Filter: show compatible posts only (availability overlap + type/field)
- Match Flow: propose slot(s) → accept/decline → lock slot
- Session Creation: auto-generate calendar invite + meeting link (Google Meet/Zoom) + confirmation page
- Notifications: email + in-app for match requests, confirmations, changes
- Optional Chat: per-match thread (pre-session coordination only)

**V1 Enhancements (Should)**

- Reputation/Badges: completed sessions, no-show rate, endorsements
- Templates: common DSA/system design packs; suggested question sets (non-proprietary)
- Reschedule flow: one-click propose new slot; audit trail
- Post expiration + re-post

**Non-Goals (MVP)**

- Real-time video calling inside PairUp
- Automated evaluation/scoring
- Public marketplace beyond Minerva community

**Key User Flows**

- Create request → see compatible candidates → request match → confirm time → join session
- Offer interviews → receive requests → accept + pick slot → session created

**Matching Rules (MVP)**

- Hard constraints: overlapping availability, same interview type/field, timezone-aware time selection
- Soft constraints: experience level preference, difficulty preference, topics overlap

**Requirements / Acceptance Criteria**

- Creating a post takes < 2 minutes; availability required
- “Compatible” feed excludes non-overlapping availability
- Session is not created until both parties confirm a specific slot
- Meeting link + calendar invite generated automatically on confirmation
- Users can cancel; counterpart notified immediately

**Success Metrics**

- Avg “clarification time” at start of call (target: < 5 min)
- Time from post → confirmed session (median)
- Match-to-session completion rate
- Cancellation/no-show rate

**Risks**

- Sparse supply of interviewers at peak times → low match rate
- No-shows undermine trust → need lightweight reliability signals
- Privacy: availability + contact info handling

**Open Questions**

- Calendar integration level: manual availability vs OAuth calendar read/write?
- Default session length (45/60 min) and buffer time?
- Minimum profile verification (Minerva email only vs alumni verification)?

**MVP Deliverable**

- Web app with structured posts, overlap-based matching, confirmations, session creation, notifications, basic chat.
