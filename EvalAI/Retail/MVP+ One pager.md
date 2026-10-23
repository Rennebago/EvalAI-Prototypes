### P1: Retail Sales Requirements
Retail Sales incorporates multi-field lookup across phone numbers, addresses, FDR IDs, calls, emails, and playbooks with agent-level trend filtering and timeline stitching.

#### Search Filters Metadata:
Multi-field lookup across Customer Phone Number (ANI), Address, FDR Applicant/Client ID, Lead Number/ID, UTMs, ABI Buckets, Lead Source Type (pre-opportunity), Opportunity Type (active pipeline) and Eligible Debt %, call duration (“calls 1 to 3 minutes”)
    Search multiple vs one at a time - could offer multiple, with comma separators - API, Lending tree, etc example
    Search and/or filter by call time
    Conversational Behavioral Tags: Index specific behaviors (e.g., agent offered term/fee exceptions or omitted eligible debt prior to enrollment) to drive targeted coaching interventions.
    Filtering/column sorting may suffice - new figma concept with dropdown to toggle between call stage vs metrics
    Handle time + activity on call(s), LPA, CoPA (connects per agent, for every 8 hrs) (review dashboard metrics from SCai explorations)
    Dollar amount associated with payouts
    Ability to simply highlight top/bottom performers in stages/steps

### Multi-Call Stitching Timeline: 
Map Call_UUID, Salesforce Lead ID, Normalized Phone Number (ANI), FDR Transaction ID, and Genesys Interaction ID / SCAI metadata to link all customer calls into a chronological interaction timeline displaying Touchpoint #, Call Date/Time, Agent Name/Email, Call Type (Initial vs. Follow-up), Call Score %, and DPR Outcome.
    How is this overlapping with SCai? HMW leverage that work? Is it redundant?
    More correlation between this and tagging (intro call, pitches, follow up, etc)

### UI Performance Views:
Provide dedicated views for Executive Scorecard & Team Performance, Agent Detail View, Call Details View (Single Call), and Call Performance Overview.