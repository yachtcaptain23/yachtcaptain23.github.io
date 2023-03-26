---
title: 'Years old revenue-hurting, client-facing bug'
date: '2023-03-18'
post_type: 'project'
visible: 'true'
---

How can you find a race-condition bug that isn't picked up by your tests nor detectable by alerting like Sentry?

That happened to me, where we were building out an appointment system where we were linking clients with therapists.

**The Scenario:**

At Soothe, our client (the user) would make a booking for a massage which we represent in our database as an `AppointmentRequest`. We'd create an `AppointmentOffer` for each therapist, so when a therapist opens up their feed, they'd see their `AppointmentOffer`s. 

After a therapist accepts an appointment offer, the status on the `AppointmentOffer` goes from `pending` to `accepted`, and any other therapist who had an `AppointmentOffer` for that `AppointmentRequest` became `expired`. An `Appointment` gets created, and both clients and therapists have an `Appointment` feed which shows their upcoming `Appointment`.

**The Issue**

This doesn't seem like there's anything wrong with the above scenario, until we found out that multiple therapists would try to accept their `AppointmentOffer`, creating more `Appointment` than we had expected. I only knew because I was tracking on Slack our call center about issues that they thought. If more therapists showed up than expected, we'd still end up paying them. This was showing up infrequently at first, but grew as the company grew.

We confirmed this issue by querying our database where there were more `Appointment` than expected.

**Discussing The Solution**

It was immediately clear that we had a locking issue. 

We couldn't lock in the backend using simple business logic, as we were running multiple processes on Heroku. 

We couldn't use a `unique` index, as users could book a couples `AppointmentRequest` as there are 2 `Appointment` associated with a filled `AppointmentRequest`.

We couldn't do a simple implementation using optimistic and pessimistic locking against the `AppointmentRequest` and `AppointmentOffer`, as there's enough after_save changes that this would require a bigger rewrite.

**My Proposed Solution**

Since we didn't want extra insertions, I proposed that the creation of our `Appointment` to when the `AppointmentRequest` was made. Then, we used pessimistic locking to prevent a double update.

**Could we have used NoSQL for locking?**

At the time, we weren't aware of Redis's ability to do locking using `setnx` and even if we did, there's the added risk of depending on one database for locking against another database.

**Key Takeaways**
- Listen to customers and call center to catch bugs that won't show up in tests or Sentry
- Pre-create rows rather than locking the table for easy row-locking