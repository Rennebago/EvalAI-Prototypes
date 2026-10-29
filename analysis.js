// ---------- Wholesale: Agent Analysis (coaching priority) and Agent Statement Audit ----------
// Built from the "Agent Analysis" and "Agent Statement Audit" sheets (EvalAI/wholesale/html file). The data is embedded here as in
// the sheets: 59 agents ranked for coaching, the top failing agents per category, and 78 agent statements reviewed for violations.
// Loaded after complaints.js and reuses the helpers in wholesale.js.

const WA_CODE = { C: "Credit Impact/Disclosure", M: "Misrepresentation", D: "Downplaying Program Summary Recording", L: "Legal Action" };
const WA_PARTNER = {
  Americanone: "American One Financial",
  Easy: "Easy Finance",
  DRAdv: "Debt Relief Advocates",
  DRProfessionals: "DR Professionals",
  DRP: "DR Professionals",
  DWD: "Done with Debt",
  Catalyst: "Financial Catalyst",
  UFN: "United Financial Network",
  Rescue: "Rescue 1 financial",
  Liberty1: "Liberty1 (Clear Vision)",
  Legacy: "Legacy",
  Empower: "Empower",
};
const WA_PRIORITY = { 1: "P1 - Immediate Coaching", 2: "P2 - Script Retraining" };
const WA_CALL_URL = "https://fdr-horizon-eval-ai-ui-v2.prd.fdrgcp.com/wholesale/call/";

// Agent email, partner, total calls, failed calls, primary failure area, secondary categories, priority (1 or 2).
const WA_ROWS = [
  ["enrique@americanonefinancial.com", "Americanone", 6, 6, "C", "", 1],
  ["leo@americanonefinancial.com", "Americanone", 6, 6, "C", "", 1],
  ["jeff.h@easyfinanceusa.com", "Easy", 5, 5, "C", "", 1],
  ["jonathan.perez@dra.com", "DRAdv", 5, 5, "M", "", 1],
  ["alan@americanonefinancial.com", "Americanone", 4, 4, "M", "", 1],
  ["cwise@empowerfn.com", "Empower", 3, 3, "C", "", 1],
  ["igor.sanchez@dra.com", "DRAdv", 3, 3, "C", "", 1],
  ["keith.w@easyfinanceusa.com", "Easy", 3, 3, "M", "", 1],
  ["michael@easyfinanceusa.com", "Easy", 3, 3, "C", "", 1],
  ["derek@americanonefinancial.com", "Americanone", 2, 2, "C", "", 1],
  ["emilly@americanonefinancial.com", "Americanone", 2, 2, "M", "", 1],
  ["nik@americanonefinancial.com", "Americanone", 2, 2, "C", "", 1],
  ["travisb@americanonefinancial.com", "Americanone", 2, 2, "C", "DL", 1],
  ["francis.w@easyfinanceusa.com", "Easy", 2, 2, "C", "", 1],
  ["logan.f@easyfinanceusa.com", "Easy", 2, 2, "C", "M", 1],
  ["manley@easyfinanceusa.com", "Easy", 2, 2, "C", "D", 1],
  ["marla.i@easyfinanceusa.com", "Easy", 2, 2, "C", "", 1],
  ["kristopher@catalystfinancial.io", "Catalyst", 2, 2, "D", "", 1],
  ["rodrigo@catalystfinancial.io", "Catalyst", 2, 2, "L", "D", 1],
  ["yuliet@catalystfinancial.io", "Catalyst", 2, 2, "M", "D", 1],
  ["gibsonc@legacyfinancialnow.com", "Legacy", 2, 2, "M", "C", 1],
  ["ivanaw@legacyfinancialnow.com", "Legacy", 2, 2, "M", "", 1],
  ["david@easyfinanceusa.com", "Easy", 7, 6, "C", "", 1],
  ["dan@easyfinanceusa.com", "Easy", 6, 5, "M", "", 1],
  ["jason.r@easyfinanceusa.com", "Easy", 5, 4, "M", "C", 1],
  ["dkennedy@empowerfn.com", "Empower", 5, 4, "C", "M", 1],
  ["jr@donewithdebt.com", "DWD", 5, 4, "D", "", 1],
  ["lamisha@legacyfinancialnow.com", "Legacy", 5, 4, "D", "", 1],
  ["dbennett@unitedfn.com", "UFN", 8, 6, "C", "", 1],
  ["mbuell@empowerfn.com", "Empower", 8, 6, "D", "", 1],
  ["adam.c@easyfinanceusa.com", "Easy", 4, 3, "D", "", 2],
  ["alvaro@catalystfinancial.io", "Catalyst", 4, 3, "D", "", 2],
  ["jephj@debtrespros.com", "DRProfessionals", 4, 3, "M", "", 2],
  ["joshua.l@easyfinanceusa.com", "Easy", 4, 3, "C", "LD", 2],
  ["nabil@americanonefinancial.com", "Americanone", 4, 3, "L", "", 2],
  ["alex@donewithdebt.com", "DWD", 4, 3, "C", "", 2],
  ["abyrne@empowerfn.com", "Empower", 4, 3, "D", "", 2],
  ["bevasco@empowerfn.com", "Empower", 4, 3, "C", "M", 2],
  ["cfreeland@empowerfn.com", "Empower", 4, 3, "C", "", 2],
  ["mmorton@empowerfn.com", "Empower", 4, 3, "D", "", 2],
  ["naveed@americanonefinancial.com", "Americanone", 7, 5, "L", "", 2],
  ["jeffsh@debtrespros.com", "DRProfessionals", 6, 4, "M", "C", 2],
  ["jose.rodriguez@americanonefinancial.com", "Americanone", 6, 4, "L", "C", 2],
  ["alexc@legacyfinancialnow.com", "Legacy", 3, 2, "L", "", 2],
  ["andy@catalystfinancial.io", "Catalyst", 3, 2, "C", "", 2],
  ["aviad@americanonefinancial.com", "Americanone", 3, 2, "M", "C", 2],
  ["carlo.narcisse@dra.com", "DRAdv", 3, 2, "C", "", 2],
  ["cvervoordt@unitedfn.com", "UFN", 3, 2, "C", "", 2],
  ["d.green@liberty1financial.com", "Liberty1", 3, 2, "D", "", 2],
  ["jhetzel@empowerfn.com", "Empower", 3, 2, "C", "D", 2],
  ["mahasan@unitedfn.com", "UFN", 3, 2, "C", "LM", 2],
  ["mathew@catalystfinancial.io", "Catalyst", 3, 2, "C", "D", 2],
  ["serena@americanonefinancial.com", "Americanone", 3, 2, "C", "M", 2],
  ["asanchez@empowerfn.com", "Empower", 12, 7, "C", "", 2],
  ["axel@americanonefinancial.com", "Americanone", 7, 4, "C", "", 2],
  ["seanp@rescue1fin.com", "Rescue", 7, 4, "C", "LM", 2],
  ["cpriesing@empowerfn.com", "Empower", 9, 5, "C", "", 2],
  ["mike@catalystfinancial.io", "Catalyst", 5, 3, "M", "C", 2],
  ["charlesh@rescue1fin.com", "Rescue", 5, 3, "C", "", 2],
].map(([email, abbr, total, failed, primary, secondary, pri]) => ({
  email,
  partner: WA_PARTNER[abbr] || abbr,
  total,
  failed,
  rate: wsPct(failed, total),
  primary: WA_CODE[primary],
  secondary: [...secondary].map((c) => WA_CODE[c]),
  pri,
  priority: WA_PRIORITY[pri],
}));

// Top failing agents per category: email, partner, calls, fails, coaching focus, priority.
const WA_TOP = {
  C: [
    ["enrique@americanonefinancial.com", "Americanone", 6, 6, "Mandatory credit disclosure script", "Immediate"],
    ["leo@americanonefinancial.com", "Americanone", 6, 6, "Mandatory credit disclosure script", "Immediate"],
    ["david@easyfinanceusa.com", "Easy", 7, 6, "Credit impact timeline explanations", "Immediate"],
    ["dbennett@unitedfn.com", "UFN", 8, 6, "Score drops & credit score risks", "High"],
    ["jeff.h@easyfinanceusa.com", "Easy", 5, 5, "Bureau reporting disclosures", "Immediate"],
    ["asanchez@empowerfn.com", "Empower", 12, 7, "Settlement impact on credit profile", "High"],
  ],
  M: [
    ["jonathan.perez@dra.com", "DRAdv", 5, 5, "Accurate savings representation", "Immediate"],
    ["alan@americanonefinancial.com", "Americanone", 4, 4, "Eliminate false program promises", "Immediate"],
    ["dan@easyfinanceusa.com", "Easy", 6, 5, "Truth in lending disclosures", "Immediate"],
    ["keith.w@easyfinanceusa.com", "Easy", 3, 3, "Verifiable qualification terms", "High"],
    ["jephj@debtrespros.com", "DRProfessionals", 4, 3, "Prohibit guaranteed fee cuts", "High"],
    ["kyroa@legacyfinancialnow.com", "Legacy", 8, 4, "Truthful timeline explanations", "High"],
  ],
  D: [
    ["mbuell@empowerfn.com", "Empower", 8, 6, "Full playback of summary WS", "High"],
    ["joshs@legacyfinancialnow.com", "Legacy", 13, 6, "Do not rush through disclaimer", "High"],
    ["jr@donewithdebt.com", "DWD", 5, 4, "Client acknowledgement audit", "Immediate"],
    ["lamisha@legacyfinancialnow.com", "Legacy", 5, 4, "Ensure explicit consumer consent", "Immediate"],
    ["adam.c@easyfinanceusa.com", "Easy", 4, 3, "Complete recording verbatim", "High"],
    ["alvaro@catalystfinancial.io", "Catalyst", 4, 3, "Mandatory recap verification", "High"],
  ],
  L: [
    ["naveed@americanonefinancial.com", "Americanone", 7, 5, "Lawsuit notification protocol", "Immediate"],
    ["jose.rodriguez@americanonefinancial.com", "Americanone", 6, 4, "Creditor legal rights script", "High"],
    ["nabil@americanonefinancial.com", "Americanone", 4, 3, "Summons & litigation risks", "Immediate"],
    ["rodrigo@catalystfinancial.io", "Catalyst", 2, 2, "Attorney representation rules", "Immediate"],
    ["alexc@legacyfinancialnow.com", "Legacy", 3, 2, "Legal escalation warnings", "High"],
    ["travisb@americanonefinancial.com", "Americanone", 2, 2, "Mandatory lawsuit disclaimers", "Immediate"],
  ],
};
const WA_TOP_ROWS = Object.fromEntries(
  Object.entries(WA_TOP).map(([k, list]) => [
    k,
    list.map(([email, abbr, total, fails, focus, priority]) => ({ email, partner: WA_PARTNER[abbr] || abbr, total, fails, rate: wsPct(fails, total), focus, priority })),
  ])
);

// Agent, partner, statement, violation confirmed (1 or 0), category, call id (empty when the sheet has no call link).
const WA_AUDIT = [
  ["randalr@debtrespros.com", "DRP", `So it's a Federal Commission-approved plan. We just lock into new terms with the creditors that override the current one.`, 1, "M", "01a13405-4802-7c0f-b3a5-0fcad874fba9"],
  ["randalr@debtrespros.com", "DRP", `And then in nine, 12 months when we give you another loan, your credit score will go higher because you won't have all this debt anymore.`, 1, "C", ""],
  ["randalr@debtrespros.com", "DRP", `You were approved for a Federal Trade Commission debt resolution program. which gets all the debts paid off in four years or less.`, 1, "M", "01a13405-3fd8-797a-8daf-5f9881ca04aa"],
  ["randalr@debtrespros.com", "DRP", `So it's a Federal Trade Commission-approved company. Obviously, they're the largest.`, 0, "M", "01a13405-4802-7c0f-b3a5-0fcad874fba9"],
  ["randalr@debtrespros.com", "DRP", `So you were approved for a Federal Trade Commission debt resolution program.`, 1, "M", ""],
  ["randalr@debtrespros.com", "DRP", `This is a Federal Trade Commission's approved plan. It'll lock you into new terms from your creditors.`, 1, "M", "01a133e7-fe40-77b4-8bb6-2882c5de0801"],
  ["jeffsh@debtrespros.com", "DRP", `Exactly. Yes, it would. Exactly. Taking off the credit report, improve your credit, cut your expenses into almost a third, right?`, 1, "C", ""],
  ["jeffsh@debtrespros.com", "DRP", `So you can repair your profile in 12 payments, which is exceptionally fast and be out of this program and a lot less than 48 months.`, 1, "C", "01a133e7-fe40-77b4-8bb6-2882c5de0801"],
  ["jeffsh@debtrespros.com", "DRP", `You were approved for a Federal Trades Commission debt resolution program. which will get all of your debts paid off in four years or less instead of making all of your regular payments to the creditors`, 1, "M", "01a133e8-0510-7997-8ba0-399256b7e4c8"],
  ["jeffsh@debtrespros.com", "DRP", `So we're here to assist you, not them, and get a settlement so that the principal is taken care of, your credit is repaired, and you have the option to accelerate through the program`, 1, "C", ""],
  ["jeffsh@debtrespros.com", "DRP", `you could verify verify a company in the better business bureau which is a government site i tell you if a company is legit or not`, 1, "M", "01a133e8-0987-7d49-8f87-eb696739b0d9"],
  ["jeffsh@debtrespros.com", "DRP", `You are approved for FTC debt resolution program, which will get you out of debt and pay off all of your creditors for the next four years.`, 1, "M", ""],
  ["jeffsh@debtrespros.com", "DRP", `It should actually boost your credit. It's not going to affect your credit in a negative aspect. It's actually going to boost your credit once you`, 1, "C", ""],
  ["jeffsh@debtrespros.com", "DRP", `It doesn't mean it applies to you. I just have to read it out loud to you. So give me a couple seconds. I'm going to connect you over the phone so they're going to read exactly what I just read for you, okay?`, 1, "D", ""],
  ["jephj@debtrespros.com", "DRP", `That's our one guarantee we can give you, is that we will never, ever make you pay more than what you originally put in.`, 1, "M", "01a133e7-dd5e-798b-a444-5f34ba8039d6"],
  ["jephj@debtrespros.com", "DRP", `You approve for a Federal Trade Commission debt resolution program which gets all the debts paid off.`, 1, "M", "01a133e7-d649-7402-a35f-a8f8eb4678a8"],
  ["jephj@debtrespros.com", "DRP", `give you one loan and restore your credit, you know, and then your score goes back up to six or 700 and you know, 700 in no time.`, 1, "C", ""],
  ["cwise@empowerfn.com", "Empower", `But now you have to remember in the back of your mind, we're going to improve your credit as well. And then that way it improves your credit as well. So where you're seeing that big impact right now that it's dropped your score down to that 586 with Equifax, it would actually improve that as you went along.`, 1, "C", "01a13402-8c26-7d33-a004-cf98daf4ce1b"],
  ["cwise@empowerfn.com", "Empower", `Any questions for me? I know that is long and redundant, and it takes forever. (Client said: "I actually did not listen to a word they were saying, so you're fine.")`, 1, "D", "01a133e5-53e8-74f0-959e-2ce3c61d79c3"],
  ["cwise@empowerfn.com", "Empower", `There's program guarantee. You're covered as far as that. (Referring to the Program Guarantee Program)`, 0, "M", ""],
  ["cwise@empowerfn.com", "Empower", `You have a full guarantee of at least a minimum of 50% reduced. Now, if they can get more, they will.`, 1, "M", "01a133e5-515b-7298-a9f7-44eec0219478"],
  ["cwise@empowerfn.com", "Empower", `now that your credit is going to improve throughout this, you're going to qualify for the 0% accounts again. So where you're seeing like 552 with Equifax right now, that would actually turn that around... As those payments get going, credit improves, turns it around.`, 1, "C", ""],
  ["dkennedy@empowerfn.com", "Empower", `Yeah, so freedom is what they call the debt modification. These are federally regulated programs. Now, at the end of the day, the banks are actually protected in these plans because it is federally regulated.`, 0, "M", "01a13402-6719-790e-9a25-be1ec2e3b833"],
  ["dkennedy@empowerfn.com", "Empower", `So debt modifications are federally regulated programs.`, 0, "M", "01a133e5-7d85-72bd-bbd2-50ceb36f04b2"],
  ["dkennedy@empowerfn.com", "Empower", `Once the agreements go through, your credit worth starts going back up because new payments are going back on these trade lines and you're paying off your debt.. So these plans are there put together to give you a discount on the debt, right, and able to pay it back at 0%, which you're going to rebuild your credit.`, 1, "C", ""],
  ["dkennedy@empowerfn.com", "Empower", `Once the agreements go through, your credit goes right back up. Does that kind of make sense? Now, I don't want you to think also these plans, you know, you do have a temporary dip in your credit, but it's only temporary. Once the new agreements go through, all of them go through, the relationships are already done when you're in these plans. Your credit goes back up.`, 1, "C", "01a133e4-ad7a-7569-a728-dbfd1ecec9f8"],
  ["dkennedy@empowerfn.com", "Empower", `for instance, in three weeks later, you get court papers in the mail and you're in a debt modification. All you're going to have to do is send that to us, right? You're legally protected. You will never see a day in court because it goes to the legal team.`, 1, "L", "01a133e4-ae8e-7d74-b5f9-f6c68c5a25de"],
  ["dkennedy@empowerfn.com", "Empower", `Okay. So this is going to help you fix your credit long-term. It's not going to happen overnight. But you'll see a huge jump in the first six to eight months, right? Now you know that your credit's going to get fixed and you don't have to worry about all these accounts because you're legally protected.`, 1, "C", ""],
  ["abyrne@empowerfn.com", "Empower", `That's not what I would anticipate. I mean, I can't tell you exactly what, you know, that it would be X number of points, but you would be in a significantly better spot coming out of this than where you're at going in. The whole goal here is to get you into a much better place, to get you into a much better place in terms of the credit scoring and credit worthiness over the course of the term.`, 1, "C", "01a13402-0cd1-7208-aa62-cc64143e4cfa"],
  ["abyrne@empowerfn.com", "Empower", `Frankly, it's a recording that we play the exact same thing for anybody that's moving forward with Turnbull. Not every element of it is directly relevant to your situation, but also There's a lot of good info in there, so we just listen to that.`, 1, "D", ""],
  ["abyrne@empowerfn.com", "Empower", `Parts of this are going to be directly relevant to your situation. There are parts of it that would be irrelevant to your situation completely. I have basically gone over everything that's relevant to you.`, 1, "D", "01a13401-af4a-7afd-ae94-a6952d64683c"],
  ["abyrne@empowerfn.com", "Empower", `So not every element of it is going to be relevant to your situation. But there's a lot of good information in here. If there's anything in there that I didn't cover, it's because I didn't expect it to be relevant to your situation.`, 1, "D", "01a133e4-af3c-7ff0-8957-60215444c5d8"],
  ["adam.b@easyfinanceusa.com", "Easy", `Sometimes they say things in a certain way that may come off kilter, but I can guarantee you I've legitimately told you nothing but the truth here. And I'm government-regulated here, and we're on a recorded line. If I'm lying to you, they're going to throw me out of this 12-story building`, 1, "M", "01a133e9-dbc0-7f31-8b1d-e4ba4aab625a"],
  ["adam.b@easyfinanceusa.com", "Easy", `And freedom moves extremely fast, so that's not really going to be an issue. But if it were, you get free legal protection anyway, so there's no risk there either.I mean, just the word sued or law makes it sound scary, but you're in no danger whatsoever.`, 1, "L", ""],
  ["jeff.h@easyfinanceusa.com", "Easy", `You will be able to pull your parachute at month six with perfect credit again. And this is the only bank that's willing to fund you with your score where it is currently. So I think it's a pretty good deal.`, 1, "C", "01a13405-101f-75d7-909e-3e2078f46e1a"],
  ["jeff.h@easyfinanceusa.com", "Easy", `So that is you're getting a reduction on the principal and 100% of the accruing interest moving forward. So that means that your $41,000 for all these accounts get reduced immediately down to $32,118.`, 1, "M", "01a13404-ccee-793b-80ff-b54efe639ead"],
  ["jeff.h@easyfinanceusa.com", "Easy", `No, sir. No, sir, because as soon as you sign up, you have legal protection across the board from every creditor that's on file for one. And for two, your creditors you have legal protection across the board and also being in Georgia, you have an added layer of legal protection.`, 1, "L", "01a13404-ccee-793b-80ff-b54efe639ead"],
  ["jeff.h@easyfinanceusa.com", "Easy", `So essentially, you'll be graduating from a debt consolidation program to a debt consolidation loan with a matching payment. So you lose your score temporarily, but you get it right back. The only downside of it is your credit score taking a temporary impact, but it's going to rebound like a checkmark.`, 1, "C", ""],
  ["keith.w@easyfinanceusa.com", "Easy", `I'm going to guarantee you a savings, okay? You no longer have to pay $7,100 a year in interest, and you will be guaranteed a savings.`, 1, "M", "01a13404-ea9b-70ce-8064-67c6f001df29"],
  ["keith.w@easyfinanceusa.com", "Easy", `In the beginning of the program, your credit score takes a dip. Now, it doesn't drop by 100 points or anything drastic. but it takes a dip in the beginning. However, over time, as your debt-to-income ratio decreases and your credit utilization ratio decreases, your credit score starts to go up to the point. In most cases, your credit score becomes better than what it was when you first started because you would have brought your debt-to-income ratio and credit utilization ratio down to zero.`, 1, "C", ""],
  ["alan@americanonefinancial.com", "Americanone", `from what I'm looking at right now, there's already $6,000 that are going to be taken care of in the first 60 days. So just imagine that, like $6,000 is going to start on your... credit report that's going to boost your lendability`, 1, "M", "01a13403-8823-7912-a8d3-ca7d1c9d2b94"],
  ["alan@americanonefinancial.com", "Americanone", `But the cherry on top is that you're going to save money on the debt that you owe and it's going to help improve your credit so that you can also have your credit available for any emergencies because you had a great credit in the past. I will also put, you know, obviously continue to set you up with our hardship department here that will help get most of these debts put off in the next six months and improve your credit in the shortest period of time.`, 1, "C", ""],
  ["alan@americanonefinancial.com", "Americanone", `It's exactly $12,459. Okay. And that number is calculated based off of what you will pay at the end of everything.`, 1, "M", "01a133e9-7d6e-733a-b50c-90a42cf7d359"],
  ["alan@americanonefinancial.com", "Americanone", `So, at this point, as we start paying off these accounts one by one, which will allow your credit to rebuild and will put you to save money and buy your home`, 1, "M", ""],
  ["enrique@americanonefinancial.com", "Americanone", `We're going to start paying off this account one by one, which allow your credit to rebuild, and we'll put you in the position where you used to be, right, back in the 700, right`, 1, "C", "01a13403-8e7e-7930-98fb-51d100f5a985"],
  ["enrique@americanonefinancial.com", "Americanone", `And you have an option for 48 months at $208, okay? So, which that'll help for you to get back to where you used to be at the 700 credit score, right? And remove basically all your debt that you have currently, right?`, 1, "M", "01a13403-8f24-7ae6-a285-525a6d4b01c1"],
  ["enrique@americanonefinancial.com", "Americanone", `Some things might apply to you, some things might not apply, right? But don't you have to worry about any of that, right?`, 1, "D", ""],
  ["enrique@americanonefinancial.com", "Americanone", `and then like i said your credit miss is gonna get back to to where it used to be you know what i'm saying it's gonna be back to the 800 you're gonna be in a better in a better situation`, 1, "C", "01a13403-3283-7efa-946e-d96284c8a378"],
  ["enrique@americanonefinancial.com", "Americanone", `You haven't been into any of that kind of trouble. So a lot of things don't apply to you, okay? So don't be scared. Let's just get our confirmation number, and then that way we can generate your contract.`, 1, "D", ""],
  ["travisb@americanonefinancial.com", "Americanone", `Now, as far as your credit goes, right, as far as your credit score goes, your credit score is going to be better than it is now just in a short six to eight months of the program, okay?`, 1, "C", "01a13402-decf-7d32-9fe8-d660c0ae460b"],
  ["travisb@americanonefinancial.com", "Americanone", `So they can't issue bank levies. They can't sue you on the debt. It will get you legally protected. How does that sound?`, 1, "L", "01a133e9-4f83-781d-abfe-6acbde210586"],
  ["travisb@americanonefinancial.com", "Americanone", `Again, this is worst case scenario no matter how unlikely it is. So 0.001% chance still got to cover it. So I always cover with my clients these two things. So the first thing I'm going to talk about in the compliance call is creditors always have the right to pursue legal action in collecting a debt, but it's far too timely and costly for them to do so.`, 1, "D", ""],
  ["alvaro@catalystfinancial.io", "Catalyst", `So there's going to be talking about taxes on forgiven debt. That wouldn't apply to you directly because you're currently insolvent to the debt. So that wouldn't apply to you directly.`, 1, "D", "01a13401-82dc-75da-90a9-45510b36475b"],
  ["alvaro@catalystfinancial.io", "Catalyst", `within six to eight months. You're going to see, you're going to have less utilization on your credit profiling and increase in your credit score because you're paying back on your borrowed balances.`, 1, "C", "01a133e5-5247-7941-8114-e59bc2ac0dc2"],
  ["alvaro@catalystfinancial.io", "Catalyst", `The reason they have that disclosure is because we've had clients in the past previously try to commit fraudulent activities with credit cards... you don't seem like the type to commit any kind of fraud, but just so you are aware why it's mentioned on there.`, 1, "D", ""],
  ["alvaro@catalystfinancial.io", "Catalyst", `These creditors can go after your income because it's protected by the government, number one.`, 1, "M", "01a133e5-06fd-71d1-b6c4-839d5c351627"],
  ["alvaro@catalystfinancial.io", "Catalyst", `Number two, you have a protected income, right? So that being said, I mean, they can't touch your money, brother, at all. Because they're going to get paid through the restructured terms. Our company also legally covers you, right?`, 1, "L", ""],
  ["mike@catalystfinancial.io", "Catalyst", `in 24 hours, we transfer them over, which means that you wouldn't have any more financial responsibility towards these specific accounts. We send letters to your creditors letting them know that we're taking over the financial responsibility. And we do get these accounts agreed upon and paid down within 30 to 90 days. That's why we transfer them over in 24 hours so that you don't have any more payment responsibility.`, 1, "M", "01a13401-9188-7da2-852a-a645e838a1da"],
  ["mike@catalystfinancial.io", "Catalyst", `Credit would be slightly impacted, but the good news is within six to eight months your credit will be right back to where it is right now or even stronger because as these accounts are paid down, it is reported as paid as agreed.`, 1, "C", ""],
  ["joshs@legacyfinancialnow.com", "Legacy", `TIMOTHY[CLIENT]: The whole amount. Yeah. Because they were not taking care of the whole amount. JOSH[AGENT]: We are. All of your creditors have already been accepted into the program.`, 1, "M", "01a13406-18fc-7f5e-8b61-42b0e8b57bd4"],
  ["joshs@legacyfinancialnow.com", "Legacy", `They should have played you. No new information. All of your creditors have already been accepted into the program. We'll get through the compliance call, and then if you have any questions, I'll answer them, although you have all this information already, and then we'll sign your disclosures.`, 1, "D", ""],
  ["joshs@legacyfinancialnow.com", "Legacy", `your score will start to improve as we start to clear up the debt for you. Of course, your utilization starts to get better. The score will start to improve for you, which is a wonderful thing.`, 1, "C", "01a133ff-0571-759b-965e-531c8a34a005"],
  ["joshs@legacyfinancialnow.com", "Legacy", `So your score will start to get better. You'll be at a lendable status. I don't even think you'll need it because you'll be debt free, but it's good to know that the score starts to get better.`, 1, "C", ""],
  ["joshs@legacyfinancialnow.com", "Legacy", `This compliance call is the legal side of the business more specifically for anybody who's behind on their debts. You are, of course, current on your debts, so we just need to play the compliance call until we are complete.`, 1, "D", ""],
  ["kyroa@legacyfinancialnow.com", "Legacy", `It's going to touch on the credit score impact and how it does go down to the beginning of the plan temporarily, but it does recover and come back stronger as these settlements come into place and they get paid down upon.`, 1, "C", "01a133fe-52e7-7916-a967-e0f48a07cb3a"],
  ["kyroa@legacyfinancialnow.com", "Legacy", `So with this approval, what my company is doing is using a – federally regulated debt restructuring plan.`, 0, "M", "01a133fd-fa06-7cf2-b9e3-4067606c0d05"],
  ["kyroa@legacyfinancialnow.com", "Legacy", `It'll say something about taxes, but you shouldn't have to worry about that. It's usually reserved for our clients that have, they're making half a million dollars a year. They have a couple hundred thousand dollars of debt that they're getting reductions on. Yeah, $50,000 of debt. So taxes, don't worry about that portion that you hear. It just, the recording has to be uniform for everybody.`, 1, "D", ""],
  ["bernardm@legacyfinancialnow.com", "Legacy", `This plan is designed to improve your credit score. So as agreements come in and your accounts are paid down to zero, your score is naturally going to improve.`, 1, "C", "01a133fe-2e3e-7f5b-bd3b-e0fc458b4a1a"],
  ["bernardm@legacyfinancialnow.com", "Legacy", `So some of the stuff in the recording will probably not apply to you because, you know, you haven't done as much damage, you know. I know 23,000 is still a lot of money, but, you know, you haven't done as much damage as some other people. But just, I like to think of it like this. During a Tylenol commercial, right, they'll tell you one of the side effects is heart attack or stroke. How likely is that to happen?`, 1, "D", ""],
  ["bernardm@legacyfinancialnow.com", "Legacy", `so obviously credit score naturally recovers to a place where it was before the debt accumulated on the accounts that you include`, 1, "C", "01a133fd-ab5e-743a-baf6-f91bfde8fd58"],
  ["bernardm@legacyfinancialnow.com", "Legacy", `Keep in mind, we deal with clients with debt sizes 10,000 to 500,000. Some of this stuff won't apply to you, but I'm going to go over what it's going to say. Give you some worst case scenarios, none of which we really see.`, 1, "D", ""],
  ["davidr@legacyfinancialnow.com", "Legacy", `As each reduction kicks in and you pay that off, it will then update on your credit report showing resolve and a zero balance, and that's going to bring up your credit score.`, 1, "C", "01a133fe-d4e7-7021-9e02-ce3d1fcad7a8"],
  ["davidr@legacyfinancialnow.com", "Legacy", `So the next part, I do apologize. This is the boring part. I do have to play a compliance recording. So please understand, there's a few things on this recording that has nothing to do with you because it's the same recording for everyone. So I'm going to go over it briefly with you so you have an understanding of what's going to be really for you and what's not. Yeah, it's a headache. But let me go ahead and get that on real quick, and then we'll get you all set up.`, 1, "D", ""],
  ["dbennett@unitedfn.com", "UFN", `Now, the recording, it's about four minutes long, a little repetitive from what we discussed. Also, everything in the recording doesn't apply to you directly. For example, more of the disclaimers you hear are for clients that are six months or more behind. So what I'll do is I'll play the recording for you so we can get that out of the way for compliance`, 1, "D", "01a13400-5c62-75ae-ba5a-e763c74ee758"],
  ["dbennett@unitedfn.com", "UFN", `It's also going to start increasing your credit scores. It's only about a three to six month timeframe.`, 1, "C", "01a133d0-9b52-77f4-8311-2faa91f13e02"],
  ["dbennett@unitedfn.com", "UFN", `A lot of the details and disclaimers don't apply to you because the account's already in collections. They're more about current accounts, and you don't have any accounts that are current going into the program, you know? So it's kind of a general recording. Again, a lot of it doesn't apply.`, 1, "D", ""],
  ["jjemun@unitedfn.com", "UFN", `So legally, a lot of these creditors cannot take legal action against you or take you to court or garnish your wages because you're not earning any wages, right?`, 1, "L", "01a13400-2b4a-7b29-abc2-f9b65ac28026"],
  ["jjemun@unitedfn.com", "UFN", `But in this sense, like I said, it's going to be informative just to give you information, but a lot of it is not really going to apply to you, okay?`, 1, "D", ""],
].map(([email, abbr, text, violation, cat, call]) => ({ email, partner: WA_PARTNER[abbr] || abbr, text, violation: Boolean(violation), cat: WA_CODE[cat], call }));

const WA_PARTNER_OPTS = ["All partners", ...[...new Set([...WA_ROWS, ...WA_AUDIT].map((r) => r.partner))].sort()];
const WA_PRIORITY_OPTS = ["All priorities", WA_PRIORITY[1], WA_PRIORITY[2]];
const WA_RESULT_OPTS = ["All results", "Violation", "No Violation"];
const WA_CAT_OPTS = ["All categories", ...Object.values(WA_CODE)];

const waState = {
  tab: "analysis",
  query: "",
  partner: "All partners",
  priority: "All priorities",
  result: "All results",
  cat: "All categories",
  top: "C",
  a: { page: 1, size: 10, sort: WS_NO_SORT() },
  s: { page: 1, size: 10, sort: WS_NO_SORT() },
};

// ---------- Cells ----------
let waEmails = null;
let waCalls = null;
function waIndex() {
  if (waEmails) return;
  waEmails = new Map([...WS_AGENTS.values()].map((a) => [a.email, a]));
  waCalls = new Map([...WS_CALLS.values()].filter((c) => c.uuid).map((c) => [c.uuid, c]));
}

const waAgentCell = (email) => {
  const a = waEmails.get(email);
  return a ? wsAgentLink(a, email) : esc(email);
};
const waPartnerCell = (name) => {
  const p = WS_PARTNERS.find((x) => x.name === name);
  return p ? wsPartnerLink(p) : esc(name);
};
const waChip = (n) => `<span class="chip chip-info" data-tip="${esc(WS_CAT[n].desc)}">${esc(wsCatShort(n))}</span>`;
const waPriorityChip = (r) => `<span class="chip ${r.pri === 1 ? "chip-Fail" : "chip-warn"}">${esc(r.priority)}</span>`;
const waRateCell = (r) => `<span class="tone-${r.rate >= 75 ? "negative" : "warning"}">${r.rate.toFixed(1)}%</span>`;
const waCallCell = (r) => {
  if (!r.call) return "–";
  const local = waCalls.get(r.call);
  return local
    ? `<a class="text-btn" href="#/wholesale/call/${local.id}">View call details</a>`
    : `<a class="text-btn" href="${WA_CALL_URL}${r.call}" target="_blank" rel="noopener noreferrer">View call details</a>`;
};

const WA_COLS = [
  { key: "email", label: "Agent Email", px: 270, sortable: true, render: (r) => waAgentCell(r.email) },
  { key: "partner", label: "Partner Organization", px: 190, sortable: true, render: (r) => waPartnerCell(r.partner) },
  { key: "total", label: "Total Calls", px: 100, num: true, sortable: true },
  { key: "failed", label: "Failed Calls", px: 105, num: true, sortable: true },
  { key: "rate", label: "Failure Rate", px: 110, num: true, sortable: true, render: waRateCell },
  { key: "primary", label: "Primary Failure Area", px: 190, sortable: true, render: (r) => waChip(r.primary) },
  { key: "secondary", label: "Secondary Categories", px: 250, render: (r) => (r.secondary.length ? r.secondary.map(waChip).join("") : "–") },
  { key: "pri", label: "Coaching Priority", px: 200, sortable: true, render: waPriorityChip },
];

const WA_TOP_COLS = [
  { key: "email", label: "Agent Email", px: 270, render: (r) => waAgentCell(r.email) },
  { key: "partner", label: "Partner", px: 190, render: (r) => waPartnerCell(r.partner) },
  { key: "total", label: "Calls", px: 80, num: true },
  { key: "rate", label: "Fail %", px: 90, num: true, render: waRateCell },
  { key: "fails", label: "Fails", px: 80, num: true },
  { key: "focus", label: "Coaching Focus", px: 280, cls: "wrap" },
  { key: "priority", label: "Priority", px: 110, render: (r) => `<b class="tone-${r.priority === "Immediate" ? "negative" : "warning"}">${esc(r.priority)}</b>` },
];

const WA_AUDIT_COLS = [
  { key: "email", label: "Agent", px: 260, sortable: true, render: (r) => waAgentCell(r.email) },
  { key: "partner", label: "Partner", px: 180, sortable: true, render: (r) => waPartnerCell(r.partner) },
  { key: "text", label: "Statement", px: 520, cls: "wrap" },
  {
    key: "violation",
    label: "Violation Confirmed?",
    px: 170,
    sortable: true,
    render: (r) => `<span class="chip ${r.violation ? "chip-Fail" : "chip-Pass"}">${r.violation ? "Violation" : "No Violation"}</span>`,
  },
  { key: "cat", label: "Category", px: 160, sortable: true, render: (r) => waChip(r.cat) },
  { key: "call", label: "Call", px: 150, render: waCallCell },
];

// ---------- Data ----------
function waFiltered(rows, texts, extra = () => true) {
  const st = waState;
  const q = st.query.toLowerCase();
  return rows.filter((r) => (st.partner === "All partners" || r.partner === st.partner) && extra(r) && (!q || texts(r).some((s) => s.toLowerCase().includes(q))));
}

const waAgentRows = () => waFiltered(WA_ROWS, (r) => [r.email, r.partner, r.primary, wsCatShort(r.primary), ...r.secondary], (r) => waState.priority === "All priorities" || r.priority === waState.priority);

const waAuditRows = () =>
  waFiltered(
    WA_AUDIT,
    (r) => [r.email, r.partner, r.text, r.cat, wsCatShort(r.cat)],
    (r) => (waState.result === "All results" || (waState.result === "Violation") === r.violation) && (waState.cat === "All categories" || r.cat === waState.cat)
  );

const waSortVal = (r, k) => (k === "violation" ? Number(r.violation) : r[k]);
const waN = (n) => n.toLocaleString("en-US");

// ---------- KPIs ----------
function waAgentKpis(rows) {
  const total = rows.reduce((s, r) => s + r.total, 0);
  const failed = rows.reduce((s, r) => s + r.failed, 0);
  const partners = new Set(rows.map((r) => r.partner)).size;
  const p1 = rows.filter((r) => r.pri === 1).length;
  const p2 = rows.length - p1;
  const all = rows.filter((r) => r.failed === r.total).length;
  return wsKpiHtml([
    { title: "Agents Flagged", rows: [`<b>${waN(rows.length)}</b><span>across ${partners} partner${partners === 1 ? "" : "s"}</span>`] },
    { title: "Calls Failed", rows: [`<b class="tone-negative">${waN(failed)}</b><span>of ${waN(total)} calls reviewed</span>`, `<span>${total ? wsPct(failed, total).toFixed(1) : "0.0"}% avg. failure rate</span>`] },
    { title: "P1 - Immediate Coaching", rows: [`<b class="tone-negative">${waN(p1)}</b><span>agents</span>`, `<span>${waN(all)} failed every call</span>`] },
    { title: "P2 - Script Retraining", rows: [`<b class="tone-warning">${waN(p2)}</b><span>agents</span>`] },
  ]);
}

function waAuditKpis(rows) {
  const v = rows.filter((r) => r.violation);
  const counts = {};
  v.forEach((r) => (counts[r.cat] = (counts[r.cat] || 0) + 1));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const agents = new Set(rows.map((r) => r.email)).size;
  return wsKpiHtml([
    { title: "Statements Audited", rows: [`<b>${waN(rows.length)}</b><span>from ${agents} agent${agents === 1 ? "" : "s"}</span>`] },
    { title: "Violations Confirmed", rows: [`<b class="tone-negative">${waN(v.length)}</b><span>${rows.length ? wsPct(v.length, rows.length).toFixed(1) : "0.0"}% of statements</span>`] },
    { title: "No Violation", rows: [`<b class="tone-positive">${waN(rows.length - v.length)}</b><span>Statements cleared</span>`] },
    { title: "Most Common Violation", rows: top ? [`<b>${esc(wsCatShort(top[0]))}</b>`, `<span>${top[1]} confirmed</span>`] : [`<b>–</b>`] },
  ]);
}

// ---------- Render ----------
function waTopRows() {
  const st = waState;
  const q = st.query.toLowerCase();
  return WA_TOP_ROWS[st.top].filter((r) => (st.partner === "All partners" || r.partner === st.partner) && (!q || [r.email, r.partner, r.focus].some((s) => s.toLowerCase().includes(q))));
}

function renderWa() {
  waIndex();
  const st = waState;
  const isA = st.tab === "analysis";
  document.querySelectorAll("#wan-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === st.tab)));
  document.querySelectorAll(".wan-a").forEach((el) => (el.hidden = !isA));
  document.querySelectorAll(".wan-s").forEach((el) => (el.hidden = isA));
  document.getElementById("wan-sub").textContent = isA ? "Agents flagged for coaching, by failure rate and failure area." : "Agent statements reviewed for confirmed compliance violations.";
  document.getElementById("wan-search").placeholder = "Search";
  if (isA) {
    const rows = waAgentRows();
    document.getElementById("wan-a-kpis").innerHTML = waAgentKpis(rows);
    fillTable("wan-a-table", WA_COLS, st.a.sort, wsRows(WA_COLS, wsPage("wan-a", st.a, sortRows(rows, st.a.sort, waSortVal))), "No agents match your filters.");
    document.querySelectorAll("#wan-top-cat button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === st.top)));
    fillTable("wan-top-table", WA_TOP_COLS, WS_NO_SORT(), wsRows(WA_TOP_COLS, waTopRows()), "No agents match your filters.");
  } else {
    const rows = waAuditRows();
    document.getElementById("wan-s-kpis").innerHTML = waAuditKpis(rows);
    fillTable("wan-s-table", WA_AUDIT_COLS, st.s.sort, wsRows(WA_AUDIT_COLS, wsPage("wan-s", st.s, sortRows(rows, st.s.sort, waSortVal))), "No statements match your filters.");
  }
}

function waRoute() {
  document.title = "EvalAI - Wholesale - Agent Analysis";
  renderWa();
}

// ---------- Init ----------
const waReset = () => {
  waState.a.page = 1;
  waState.s.page = 1;
  renderWa();
};
setupDropdown("dd-wan-partner", WA_PARTNER_OPTS, () => waState.partner, (v) => {
  waState.partner = v;
  waReset();
});
setupDropdown("dd-wan-priority", WA_PRIORITY_OPTS, () => waState.priority, (v) => {
  waState.priority = v;
  waReset();
});
setupDropdown("dd-wan-result", WA_RESULT_OPTS, () => waState.result, (v) => {
  waState.result = v;
  waReset();
});
setupDropdown("dd-wan-cat", WA_CAT_OPTS, () => waState.cat, (v) => {
  waState.cat = v;
  waReset();
});
[
  ["dd-wan-a-size", "a"],
  ["dd-wan-s-size", "s"],
].forEach(([id, k]) =>
  setupDropdown(id, ["5", "10", "15"], () => String(waState[k].size), (v) => {
    waState[k].size = Number(v);
    waState[k].page = 1;
    renderWa();
  }, { prefix: "View " })
);

bindSort("wan-a-table", () => waState.a.sort, renderWa);
bindSort("wan-s-table", () => waState.s.sort, renderWa);

[
  ["wan-a", "a"],
  ["wan-s", "s"],
].forEach(([id, k]) => {
  document.getElementById(id + "-prev").addEventListener("click", () => {
    waState[k].page -= 1;
    renderWa();
  });
  document.getElementById(id + "-next").addEventListener("click", () => {
    waState[k].page += 1;
    renderWa();
  });
});

document.getElementById("wan-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b || b.dataset.tab === waState.tab) return;
  waState.tab = b.dataset.tab;
  renderWa();
});
document.getElementById("wan-top-cat").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-cat]");
  if (!b) return;
  waState.top = b.dataset.cat;
  renderWa();
});
document.getElementById("wan-search").addEventListener("input", (e) => {
  waState.query = e.target.value.trim();
  waReset();
});

document.getElementById("wan-download").addEventListener("click", () => {
  if (waState.tab === "analysis") {
    const rows = waAgentRows();
    saveCsv(
      [
        ["Agent Email", "Partner Organization", "Total Calls", "Failed Calls", "Failure Rate", "Primary Failure Area", "Secondary Categories", "Coaching Priority"],
        ...rows.map((r) => [r.email, r.partner, r.total, r.failed, r.rate.toFixed(1) + "%", r.primary, r.secondary.join("; ") || "None", r.priority]),
      ],
      "agent-analysis.csv"
    );
    toast(`Exported ${rows.length} agents`);
    return;
  }
  const rows = waAuditRows();
  saveCsv(
    [["Agent", "Partner", "Statement", "Violation Confirmed?", "Category", "Call Link"], ...rows.map((r) => [r.email, r.partner, r.text, r.violation ? "Violation" : "No Violation", r.cat, r.call ? WA_CALL_URL + r.call : ""])],
    "agent-statement-audit.csv"
  );
  toast(`Exported ${rows.length} statements`);
});
