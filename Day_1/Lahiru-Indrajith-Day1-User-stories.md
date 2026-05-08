# LearnLanka — User Story Set v0.1

## Story 1: {Short title}
As a Student I want to search the tutor by the language, price range, subject, availability So that I can learn the way I intended matching my schedule and budget

### Acceptance Criteria
Given that the student successfully logged in when student enters search filters and clicks search then the system should display matching tutors.

Given that Matching tutors are displayed when search results are shown then the system should display the all the details and ratings alongside the availability of the tutor.

Given no matching tutor was found when search is performed then the system shall display "No matching tutors found" message.


### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

---

## Story 2: {Short title}
As a Student I want to book a tutoring session with a tutor so that I can attend a one to one online class

### Acceptance Criteria
Given the student is viewing a tutor profile when student selects an available time slot then the system shall allow the booking request to be submitted

Given the booking request is successful when the tutor accepts the booking request then the student shall receive a booking successful notification.

Given the selected slot by the student is unaavailable when student attempts to book then system should display time slot is unavailable try selecting a different slot

### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

## Story 3: {Short title}
As a Tutor I want to be able to accept or decline booking request So that I can fit the online session to match my schedule.

### Acceptance Criteria
Given that a Booking request is displayed when tutor accepts the request then the student is notified that the online session is confirmed.

Given that a Booking request is displayed when tutor decline the request then the student is notified that the booking request has been canceled by the tutor

Given that a booking request is cancelled by the student but still shown to the tutor when tutor selects either choice then the system display the request is already canceled by the student

### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

## Story 4: {Short title}
As a Tutor I want to be able to manage my accepted online sessions So that I can notify or request a change from the student about the online tutoring session 

### Acceptance Criteria
Given that Upcoming booked tutoring sessions are displayed when tutor clicks on reschedule on a selected session and select a different time slot with stating reason for the reschedule then the student is notified and given a request that he can accept or decline to the reschedule request

Given that student is shown the request to reschedule when student clicks on the accept then the tutor is notified that reschedule request is accepeted and online session is rescheduled successfully.

Given that student is shown the request to reschedule when student clicks on decline then the tutor is notified that they declined and canceled the online session automatically


### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

## Story 5: {Short title}
As a operational admin I want to moniter user activities and bookings so that I can maintain platform quality and minimize operational issues.

### Acceptance Criteria
Given the admin is logged into the admin dashboard when the dashboard loads then booking analytics and statistics, user activity summeries diplayed

Given suspicious activity occurs when system detecs abnormal behavior pattern then admin should receive an alert

Given the admin searches for a booking record when filters are applied  then the system shall display the matching records.

### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

## Story 6: {Short title}
As an admin I want to verify tutors details So that only qualified tutors are approved on the platform

### Acceptance Criteria
Given a tutor submit registration documents when the admin reviews the submission then the system should allow the admin to approve or reject.

Given a tutor is approved when admin complete the approval process then the tutor accound should become active and notified the tutor

Given a tutor is rejected when the admin selects reject in the submission then the tutor shall receive a rejection notification

Given a tutor submission is on hold when an admin request more documents for verification then tutor should be notified to provide clear and up to date documentation to complete the submission

### INVEST self-check
- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable