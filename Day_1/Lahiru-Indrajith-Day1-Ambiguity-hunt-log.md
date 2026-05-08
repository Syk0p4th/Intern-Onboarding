# LearnLanka — Ambiguity Hunt Log

## Brief reference
LearnLanka connects Sri Lanka O/L and A/L students with vetted tutors for one-to-one online sessions. Students should be able to find tutors by subjects, language, and price; book and pay; rate the tutor afterwards. Tutors set their availability and get paid weekly. We want it to be fast, secure, and ready before exam season.

## Findings
| # | Quote | Why ambiguous | Clarification question | Priority |
|---|-------|---------------|------------------------|----------|
| 1 | connects O/L and A/L students with vetted tutors for one-to-one online sessions | It is unclear that the system only help students help booking payment | Should the platform help discover tutors, handle booking, payment and session management?| H |
| 2 | O/L and A/L students | The exact age group is unclear | Should parents also have a account to give approval for students who are under the age consent? | H |
| 3 | language | It is unclear whether language means tutor language, session language, or system UI language. | Does language refer to teaching language, platform language or UI language or both? | H |
| 4 | Book and pay | Payment flow is unclear and not specified | Should payment occur before the session , after the session or partially upfront | H |
| 5 | Rate the tutor afterwards | This Assumes only students get to rate tutors | Can tutors also rate students or Just students? | H |
| 6 | Afterwards | Timing for rating is unclear | How long after a completed session can the ratings be submitted | M |
| 7 | Tutors set their availability | Scheduling method is unclear | Can tutors create recurring schedules or just manual time slots? | M |
| 8 | fast | no measurable performance target exist | What responce time or loading speed defines "fast"? | H |
| 9 | secure | Security requirements are unclear | What security standards are mandatory for authentication and payments? | H |
| 10 | ready before exam season | Timeline is unclear | What is the exact release deadline before exam season? | H |
| 11 | pay | Currency and pricing rules are unclear | will payments only support LKR or international payements as well? | M |


## Results Summary
| Metric | Target | Achieved |
|--------|--------|----------|
| Items found | 10+ | 11 |
| High-priority items | 3+ | 8 |
| Items convertible to test cases | 5+ | 11 |

## Top 3 questions to ask the founders
- 1. What are the exact functions needed to be included in the MVP before the exam season?
- 2. Should students below age of consent require parent or guadian during the approval process?
- 3. Are tutors allowed to teach minors without additional verification?

## Reflection
- What kind of ambiguity tripped you up most?
The use of words like "fast" or "Secure" without any measurable targets

- Which question is most likely to change the architecture if answered?
Does this platform need to on a platform that built from scratch or depend on a known third-party learning management system.