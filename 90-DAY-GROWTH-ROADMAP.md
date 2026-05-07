# ClosePro Remodel: 90-Day Growth Roadmap

**Goal:** Acquire 100 paying customers in 90 days to validate market fit and secure funding

**Key Metrics to Track:**
- Trial signups: Target 150-200 (need ~50% conversion to 100 paid customers)
- Trial conversion rate: Target 40-50%
- Time to activation ("aha" moment): Target < 4 hours
- Customer acquisition cost: Target < $20 (blended organic + early paid)
- Monthly recurring revenue (MRR): Target $9,900 (100 customers × $99 avg)

---

## Phase 1: Foundation (Days 1-14) ✅ PARTIALLY COMPLETE

### Completed:
- ✅ Stripe webhook integration for payment processing
- ✅ Firebase Admin setup for server-side Firestore operations
- ✅ OnboardingService for tracking user progress
- ✅ EarlyAdopterService for first 25-50 customer tier with special pricing
- ✅ MetricsService for KPI tracking
- ✅ OnboardingSetupWizard component for personalized first-run experience

### Still To Do:
- [ ] **Integrate OnboardingSetupWizard into Dashboard**
  - Show after first login
  - Track completion rate
  - Use responses to personalize feature education

- [ ] **Implement First-Run Personalized Checklist**
  - In Dashboard.tsx, replace static onboarding checklist with dynamic one
  - Base steps on user's business type and challenge
  - Add success animations and celebration moments

- [ ] **Create Early Adopter Offer Modal**
  - Show to new users during first week
  - Highlight 50% savings for first 6 months
  - Request commitment to case study/testimonial
  - Track acceptance rate

- [ ] **Add Key Activation Events**
  - Recording events in OnboardingService when users complete actions
  - Complete profile → `profile_completed`
  - Create first project → `first_action`
  - Generate first estimate → `aha_moment` (critical trigger)
  - Generate first AI visualization → `aha_moment` (critical trigger)

- [ ] **Metrics Dashboard Component**
  - Show trial conversion rate (target: 40%+)
  - Show MRR progress toward $9,900
  - Show customer count progress toward 100
  - Show engagement metrics (projects, estimates, AI generations)
  - Admin-only view

---

## Phase 2: Conversion Optimization (Days 15-30)

### Trial-to-Paid Conversion:
- [ ] **Add "Trial Expiration Reminder" Emails**
  - Day 1: Welcome and setup instructions
  - Day 3: "Check out the AI Visualizer" (showcase feature)
  - Day 5: "You're missing out! See how contractors like you are closing more deals"
  - Day 6: "Last chance — here's your early adopter offer"

- [ ] **Implement In-App Trial Counter**
  - Show days remaining at top of dashboard
  - Create urgency in UI
  - Show savings message if they upgrade now

- [ ] **Feature Gating Based on Plan**
  - Limit AI generations: 5/month on trial, unlimited on paid
  - Limit active projects: 3 on trial, 10-unlimited on paid
  - Show upgrade prompts when hitting limits

- [ ] **Improve Estimate Generation Flow**
  - Make it faster and easier
  - Show template options
  - Add "Generate with AI" button for auto-population

- [ ] **Add Client Portal Preview**
  - Let users see what their clients will see
  - Add "invite test client" feature
  - Show potential value of paid feature

### Customer Success:
- [ ] **Implement "Day 1 Success Call" Reminder**
  - In OnboardingSetupWizard, offer to schedule
  - Calendar integration (Calendly/Cal.com)
  - Send email 24h before call

- [ ] **Add In-App Guided Tours**
  - Show key features on first visit to each major section
  - Highlight actions ("Click here to create first project")
  - Measure tour completion rate

- [ ] **Improve First Project Creation**
  - Add "Quick Start" template button
  - Pre-fill with example data
  - Show before/after of what estimate will look like

---

## Phase 3: Acquisition Amplification (Days 31-60)

### Organic Growth Tactics:
- [ ] **Optimize Landing Pages for Conversion**
  - A/B test hero messaging
  - Add social proof (testimonials, case studies)
  - Show ROI calculation ("Save $X per year")
  - Add FAQ section

- [ ] **Create Lead Magnet Landing Page**
  - "5 Kitchen Remodel Examples You Can Show Clients"
  - Collect email for lead capture
  - Link to AI Visualizer demo

- [ ] **Implement Blog/Content Strategy**
  - Post on LinkedIn 3x/week about remodeler challenges
  - Write SEO blog posts targeting "AI remodel tool", "contractor software", etc.
  - Include CTAs linking to demo or tool

- [ ] **Build Referral Program**
  - Offer $25-50 credit for each successful referral
  - Track referral source in MetricsService
  - Show referral link in dashboard

### Paid Acquisition (when organic traction is validated):
- [ ] **Google Ads Campaign**
  - Keywords: "AI remodel tool", "contractor CRM", "kitchen remodel visualizer"
  - Target landing pages with strong conversion
  - Budget: Start with $200-300/month

- [ ] **Retargeting Campaign**
  - Show ads to website visitors who don't convert
  - Different messaging: "Check out what other contractors are doing"
  - Budget: $100-150/month

### Outbound Sales (CEO/Co-founder Led):
- [ ] **Create Outbound List**
  - 500-1000 contractors in target markets
  - Research by industry (kitchen, bathroom), location, website quality
  - Prioritize those with active social media

- [ ] **Personalized Email Campaign**
  - Subject: "AI-powered estimates for [Contractor Type] - [Specific Pain Point]"
  - Body: Show before/after example, specific to their niche
  - CTA: "Book a 15-min demo"

- [ ] **LinkedIn Outreach**
  - Connect with target contractors
  - Share relevant content about their business challenges
  - Follow up with demo offer

- [ ] **Cold Call Script**
  - Focus on pain: "Do you struggle to close remodeling projects?"
  - Focus on solution: "What if you could show clients exactly what they'll get?"
  - Ask: "Can I show you something in the next 10 minutes?"

---

## Phase 4: Scaling & Retention (Days 61-90)

### Upsell & Expansion:
- [ ] **Implement Plan Upgrade Prompts**
  - "You're creating lots of projects — want to add more team members?"
  - "Interested in advanced reporting?"
  - Track which features drive upgrades

- [ ] **Add "Early Adopter Graduated" Offer**
  - After 6 months, transition to regular pricing
  - Offer extended discount if they upgrade to higher plan
  - Highlight ROI they've achieved

### Retention & Activation:
- [ ] **Create "Win Back" Campaign for Inactive Users**
  - Identify users with no activity in 14 days
  - Send email: "We miss you — here's what's new"
  - Offer support call

- [ ] **Add NPS (Net Promoter Score) Survey**
  - After 30 days of usage
  - If promoter: Ask for referral or testimonial
  - If detractor: Offer support call to fix issues

### Case Studies & Social Proof:
- [ ] **Collect Success Stories from Early Adopters**
  - Reach out to customers with commitments
  - Document results: jobs won, time saved, revenue impact
  - Create 3-5 case studies

- [ ] **Produce Video Testimonials**
  - Film 2-3 contractors sharing their experience
  - Use in landing page, email campaigns, LinkedIn
  - Share on social media

- [ ] **Build Social Proof Section**
  - Add customer logos to landing page
  - Include testimonials and quote snippets
  - Show MRR milestones ("100 contractors trust ClosePro")

---

## Technical Debt & Infrastructure

- [ ] **Complete Email Template System**
  - Implement email verification (SendGrid/AWS SES)
  - Create reusable email components
  - Track email open/click rates

- [ ] **Enhance Analytics**
  - Integrate Google Analytics / Mixpanel
  - Track user funnel: visit → signup → trial → paid
  - Set up conversion tracking for each step

- [ ] **Implement Support Ticketing**
  - Add in-app chat or support widget (Intercom/Zendesk)
  - Track response time and satisfaction
  - Route to team based on category

- [ ] **Add Admin Dashboard KPI Section**
  - Real-time metrics display
  - 90-day goal progress
  - Trial conversion funnel visualization
  - Revenue dashboard

- [ ] **Automate Onboarding Emails**
  - Use server.ts to send transactional emails
  - Create email schedule in database
  - Track opens and clicks

---

## Success Metrics & Tracking

### Primary Metrics (Track Daily):
- **Signups Today**: Count of new trial users
- **Trial Conversions**: Count of users who upgraded to paid
- **Conversion Rate**: (Conversions / Total Trial Users) × 100
- **MRR Progress**: (Current MRR / $9,900 target) × 100

### Secondary Metrics (Track Weekly):
- **Activation Rate**: % of users who completed onboarding
- **Aha Moment Reach**: % who created first estimate or AI generation
- **Early Adopter Adoption**: % who accepted early adopter offer
- **Average Feature Engagement**: projects, estimates, AI uses per user

### Tertiary Metrics (Track Monthly):
- **Customer Satisfaction (NPS)**: Target > 50
- **Case Study Readiness**: # of customers willing to be featured
- **Referral Rate**: % of customers sending referrals
- **Churn Rate**: % of customers who cancelled

---

## Next Immediate Actions (Days 1-3)

1. **Integrate OnboardingSetupWizard into Dashboard**
   - Show after first login if user hasn't completed setup
   - Save responses to Firestore
   - Track completion in analytics

2. **Implement Early Adopter Offer Modal**
   - Show to new free trial users (days 1-7)
   - Track acceptance rate
   - Create Stripe subscription logic for early adopter pricing

3. **Create Metrics Dashboard**
   - Admin-only view showing 90-day progress
   - Real-time trial/conversion metrics
   - MRR progress toward $9,900

4. **Add Email Verification & First Onboarding Email**
   - Send welcome email on signup
   - Include onboarding checklist
   - Link to video tutorials

5. **Set Up Analytics Events**
   - Track all user actions in MetricsService
   - Create funnels in Google Analytics
   - Implement conversion tracking

---

## Risk Mitigation

### If trial conversion is low (<25%):
- Implement in-app support calls (Intercom)
- Add more contextual help and guided tours
- Make first project creation even simpler
- Consider lowering first-month price

### If acquisition is slow (<5 signups/day):
- Increase paid ad budget
- Launch more aggressive outbound campaign
- Improve landing page conversion
- Add referral incentives

### If activation is low (<30% reach aha moment):
- Simplify first project creation
- Add pre-populated templates
- Offer 1:1 onboarding calls
- Create video tutorials

