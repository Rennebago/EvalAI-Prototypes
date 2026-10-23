# **EvalAI \+ SetOps Walkthrough**

Jun 17, 2026

**Attendees:**  
Yasha, Renn, Simone Williams, Gus, Ryan Thornton, Oz Fernandez, Regina Crull

## Problem Statement

The SetOps team currently lacks a unified operational intelligence platform, forcing reliance on fragmented systems, manual processes, and reactive reporting. This lack of infrastructure creates significant barriers to identifying agent performance trends, streamlining Quality Assurance (QA), and connecting specific call behaviors to financial settlement outcomes.

## Summary

### Foundational Needs (Data & Visibility)

* **Operational Visibility:** Currently, there is a lack of visibility regarding basic call metrics, such as identifying inbound versus outbound calls, agent performance trends, and daily activity.  
* **Process Automation:** There is no efficient way to link Salesforce activity with call recordings, forcing supervisors to manually search for calls to conduct quality assurance.  
* **Data Integrity:** The team lacks the ability to easily aggregate data across multiple days or agents, hindering the ability to perform high-level analysis on team performance or individual trends.

### Functional Needs (Quality Assurance & Workflow)

* **Scalable QA Process:** Current processes require supervisors to manually listen to calls one by one, which is inefficient and limits audit capacity.  
* **Standardized Scoring:** Implementing a scoring rubric for call quality is essential to identify skill issues, understand low outcomes, and ensure compliance with mandatory disclosures (e.g., opening/closing, account verification).  
* **Workflow Integration:** Improving the connection between Salesforce notes and Genesys recordings is necessary to streamline the audit process and identify gaps in effort or time management.

### Strategic Objectives (Outcomes & Growth)

* **Improved Settlement Outcomes:** The primary vision is to increase settlement liquidation from the current \~46% to 50% by optimizing call flow processes.  
* **Performance Optimization:** Beyond just scoring, the goal is to ensure high-quality calls that demonstrate proper handling, effort, and accurate dispositions, ultimately influencing the negotiation service’s success.  
* **Predictive Insight:** Moving beyond reactive auditing, the team aims to use call data to understand creditor-specific trends, improve coaching, and align call behaviors with successful settlement outcomes.

## Primary tools used today

1. Salesforce: full CRM system  
2. Genesys to EvalAI: stores and evaluates calls  
3. Tableau: overall department performance, outcomes, and allocated accounts

## Notes

Tool usage

1. Tableau overall dept performance \- performance of outcomes, accounts that have been allocated  
2. Genesys \+ Evalai stores calls \- Jeff Stevens (check with apoorva)  
3. Salesforce \- Rich Miralez

Do the manual settlements \- agents work through email or calling creditors  
Outbound call team \- some inbound from creditors  
Currently for calls, we don't really have a process yet \- Regina created a process  
Genesys has potential to review reporting  manipulate the recording to get the info we need

1. Phone number  
2. Creditor (dont see that today)  
3. Timeframe when that number is attached to that creditor  
4. Duration  
5. What happened on call

No way to pull multiple days for one agent  
No visibility on call quality, no QA process  
Supervisors have to 1 by 1 listen to calls and ascertain any skill issues, etc.

**75% of calls with phone creditors \- 9,000 accounts**

That’s one day, how about every day for all agents, call time, quality of calls  
We don’t have that picture for high-level teams \+ individual every day trends

**Genesys listening manually to calls**  
If account comes up in question, needs to pull up in SF, check time of call, go back to genesys and open call/listen  
Time per call to do this: 2-3 mins, depends on call duration (but some calls could be an hour, but may not even audit those, not worth the time-management)  
How many calls per day avg? 21-25 calls a day, per person (across all 43  agents)

In order to influence sett outcomes, need to score the quality of calls, attach to outcomes  
Inbound \- lesser amount, don’t audit these unless there’s a specific situation \- different requirements for inbound calls.

Look at my team, who in my team is not performing in certain areas  
Creditor POV: how does the flow work for certain creditors? Ex. typically 1 hour and some take 2? Why is it taking an extra hour

- Show calls for specific creditors and trends, is a low score in the call flow affected by specific creditors? (SF marry)  
  - NOT creditor dependant, call dependant \- key phrase mentioned on a call  
    - IF a phrase is said on a call (even if not required) is still will need to be scored

Scope all calls

Genesys view is really high-level, see what each agent has handled and top avg. \- doesn’t show the nitty gritty, like did they get into calls within the 1st 30 mins of their day?

- To do this they need to go to that agent’s detail page  
- date/time, total time, remote type, direction (outbound/inbound)  
- Has plugged this into ai to help find time-gaps but was only ‘fine’  
- Would want to see time gaps (not enough time on calls, or too much time on calls)

**What do we want the scope to be to start?**

1. All calls scored \- pull all calls/transcripts from Gen and score against rubric  
   1. *Ex. see 80% of calls are a 4, but outcome is low \- want to understand that outcome reasoning*  
   2. *Agents scoring trends \- how to coach, areas for improvement*  
   3. *Creditor (ground truth doc)*  
2. Ultimate call workflow scoring bulk:by agent  
3. Link from SF (date and time agent made a note), indicates to genesys to find a matching phone call for that update (more operational ask, vs scoring)  
4. See how each agent is performing on all calls AND how we’re performing as a department

**Vision Scope:**

1. Improve our sett \$ through improve call flow processes  
2. Client roadmap, when a goal is prioritized \- welcome, to UW, to drafting, to roadmap, to creditor relationship/timing  
   1. Timing becomes more critical  
3. 46% avg of prioritized inventory, \$44/45m monthly in settlements, aim to 50% liquidation  
4. Achieve this through improved call flow process  
5. Not just score the calls, but we have high quality calls with proper handling, proper amount of effort put in, dispositions, etc

**Salesforce views / Negotiation Service**

- Does NOT indicate inbound/outbound unless agent notes it

**Ground-Truth Doc breakdown**

1. Viewing scripts \- certain disclosures given to the client; transcript picks up keywords  
   1. Auth is not on file “Member needs to be on the line” to get verbal consent  
2. Opening, account ver, and closing have to be done every call \- per account not per call