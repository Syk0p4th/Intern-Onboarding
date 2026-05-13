# LearnLanka — Requirements Document

## 1. Problem Statement
Students facing O/L or A/L exams in Sri Lanka face difficulties finding trustworthy, expirienced, affordable, reliable tutors for one to one online sessions. Find ones that match the budget and time schedule.At the current stage the tutoring process highly rely on social media and personaly contacting each and tutor which is unrealiable and payment inefficient.At the same time, tutors also face difficulties reaching studnets and managing their bookings efficiently due to these problems they face lack of consistant income without a centralized system. With LearnLanka aims to solve these issues by providing a centralized online tutoring platform that enables easy tutor discovery, secure bookings, session management and tranparency between students and tutors
 
## 2. Personas
Student - Goal: 
Find Qualified Tutors Quickly
Book a tutoring sessions quickly
Learn in a preferred Language

Students - Frustrations:
Difficulty finding trustworthy tutors
Inconsistant Pricing among tutors
Poor communication and scheduling conflicts

Tutor- Goal
Reach more students efficiently 
Receive payments on time
Managing schedules and bookings easily

Tutors - Frustrations
Delayed and unreliable payments
Last minute cancellations by students 
Difficulty Reaching students consistantly

Operations Admins - Goals
Ensure the intended operations of the tutoring platform smoothly 
Resolve disputes between students and tutors efficiently
Moniter bookings and session activities to maintain quality

Operations Admins - Frustrations
Fake tutor informations during the registration process
Tutors missing session or cancelling frequently
Payment and refund complications


## 3. Functional Requirements
Student 
1.The system should allow users to create account using their email or phone number
2.The system should allow students to login securely using their credentials
3.Students can make online payments for their online sessions
4.The Students must be able to cancel their booked online sessions before a certain time period 
5.The students should be able to see the tutors details and ratings before booking a session

Tutor - 
1.Tutors should be able to upload their qualifications to get verified as a tutor
2.The system shall allow tutors to set their language, price, and available time slots.
3.The system should allow tutors to accept or decline students online session requests 
4.The tutors should be able to reschedule or cancel a online session
5.The system should allow tutors to communicate to students through the platform

Operations admins - 
1.The system should allow admins to login securely with admin privillages
2.The admins should be able to suspend or remove a user account.
3.The system shall display platform activity dashboards to admins
4.The admins should be able to moderate the reviews and reported content.
5.The admins should be able to manage user complaints and disputes


## 4. Non-Functional Requirements

| Category      | Metric (SLI)                          | Target (SLO)         | Measurement Source       |
|---------------|----------------------------------------|----------------------|--------------------------|
| Latency       | Search API response time, p95          | < 800 ms             | Azure Application Insights |
| Availability  | /book endpoint successful response %   | 99.5% per calendar mo| Azure Monitor + synthetic  |
| Concurrency   | Active video sessions                  | >= 200 simultaneous  | Daily.co dashboard         |
| Latency       | Search result response time            | <= 3 seconds         | Azure Application Insights |
| Compatibility | Platform support                       | IOS and Android Tablets, Phones | BrowserStack              |
| Reliability   | Booking completion rate                | > 95%                | Azure Application Insights |
| Availability  | Platform access uptime                 | 99.5%                | Azure Monitor             |
| Latency       | Tutor notification time after booking  | < 1 minute           | Azure Notification Hubs  |
| Reliability   | Tutor booking acceptance window        | Before 12 hours prior| Booking system logs      |
| Latency       | Booking update time                    | < 2 minutes          | Azure Application Insights |
| Accuracy      | Tutor availability data accuracy       | Booking conflicts <1%| Database validation logs  |
| Latency       | Admin dashboard load time              | < 5 seconds          | Azure Application Insights |
| Completeness  | Admin actions log coverage             | 100%                 | Azure Log Analytics      |
| Backup        | Admin data backup frequency            | Daily, <100% data loss| Azure Backup logs        |
| Scalability   | Concurrent ticket support              | Up to 500            | Azure Load Testing       | 
 

## 5. Assumptions
The Video calling third party application works 95% of the time.
The Students and Tutors will always give a rating to each other after session.
The 90% percent of the tutors have adequete Streaming capabilities to the students.
Payment gateway and online payment services are available in Sri Lanka
The Admins able to verify and resolve disputes as intended 
All users agree to the terms and conditions 



## 6. Out of Scope
In-Built Video Calling Service built from scratch.
Complete learning management system with Assignment Grading
Offline cash payment methods handling by the platform
Parent portal to see the progress of their children
Support for University level and professional levels education and certifications

