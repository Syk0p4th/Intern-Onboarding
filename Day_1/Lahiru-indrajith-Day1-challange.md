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
Student - The system should allow users to create account using their email or phone number
The system should allow students to login securely using their credentials
Students can make online payments for their online sessions
The Students must be able to cancel their booked online sessions before a certain time period 
The students should be able to see the tutors details and ratings before booking a session

Tutor - Tutors should be able to upload thier qualifications to get verified as a tutor
The system shall allow tutors to set their language, price, and available time slots.
The system should allow tutors to accept or decline students online session requests 
The tutors should be able to reschedule or cancel a online session
The system should allow tutors to communicate to students through the platform

Operations admins - The system should allow admins to login securely with admin privillages
The admins should be able to suspend or remove a user account.
The system shall display platform activity dashboards to admins
The admins should be able to moderate the reviews and reported content.
The admins should be able to manage user complaints and disputes


## 4. Non-Functional Requirements
- Table with columns: Category, Metric, Target, How we'll measure it

Students - The search result responce time under <= 3 seconds
The platform should work on both IOS and Android Tablets, Phones
Students should be able to complete a booking over 95% of the times
Students shall be able to access the platform 99.5% of the time

Tutors - The tutors should notified within < 1 minute after creating a booking
Tutors Should be able to accept a booking before 12 hours prior to the scheduled time 
Tutors should be able to update a booking < 2 minutes
Tutors avalability data should remain accurate with booking conflicts should be <1%.

Operational Admin - Admin dashboard data should load < 5 seconds
Admin actions log coverage should be 100% 
Admin data should be backed up daily to prevent data loss with <100% data back ups
System shall support tickets up < 500 at once 
 

## 5. Assumptions
The Video calling third party application works 100% of the time.
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

