import { Link } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';

const SECTIONS = [
  {
    id: "1",
    title: "Acceptance of Terms",
    content: [
      {
        sub: "Agreement to Terms",
        text: "By accessing or using the ClosePro Remodel platform, website, and related services (collectively, the \"Service\"), you agree to be legally bound by these Terms of Service (\"Terms\") and all applicable laws and regulations. If you do not agree with any of these Terms, you are prohibited from using or accessing the Service."
      },
      {
        sub: "Updates to Terms",
        text: "ClosePro Remodel reserves the right to modify these Terms at any time. We will provide at least 30 days' notice of material changes via email or prominent website notice. Your continued use of the Service after the effective date of any modification constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically."
      },
      {
        sub: "Eligibility",
        text: "You must be at least 18 years old and have the legal authority to enter into contracts to use the Service. By using the Service, you represent and warrant that you meet these requirements and that all information you provide is accurate and complete."
      }
    ]
  },
  {
    id: "2",
    title: "Account Registration and Security",
    content: [
      {
        sub: "Account Creation",
        text: "To access most features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update this information to keep it accurate, current, and complete."
      },
      {
        sub: "Account Security",
        text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify ClosePro Remodel of any unauthorized use of your account or any other breach of security. ClosePro Remodel is not liable for any loss or damage arising from your failure to maintain account security."
      },
      {
        sub: "One Account Per User",
        text: "Each user may maintain only one active account unless otherwise expressly permitted by ClosePro Remodel in writing. Creating multiple accounts to circumvent plan restrictions or for any other abusive purpose is prohibited."
      }
    ]
  },
  {
    id: "3",
    title: "Subscription Plans and Billing",
    content: [
      {
        sub: "Subscription Tiers",
        text: "The Service is offered in subscription tiers (Starter, Growth, and Pro), each with different features and usage limits as described on our pricing page. You agree to the features and limitations of your selected plan."
      },
      {
        sub: "Billing and Payment",
        text: "Subscription fees are billed monthly or annually in advance, depending on your selected billing cycle. All fees are in US dollars and non-refundable except as expressly stated in our Refund Policy. By providing a payment method, you authorize ClosePro Remodel to charge applicable fees when due."
      },
      {
        sub: "Free Trial",
        text: "If you begin a free trial, you will not be charged until the trial period ends. You may cancel during the trial period to avoid charges. We reserve the right to modify or cancel free trial offers at any time."
      },
      {
        sub: "Price Changes",
        text: "We reserve the right to change our pricing with 30 days' advance notice to existing subscribers. Price changes will take effect at the start of your next billing cycle after notice."
      },
      {
        sub: "Refund Policy",
        text: "Monthly subscriptions are non-refundable. Annual subscriptions may be refunded on a pro-rated basis within the first 30 days of purchase. After 30 days, annual subscriptions are non-refundable. To request a refund, contact billing@closeproremodel.com."
      }
    ]
  },
  {
    id: "4",
    title: "Acceptable Use Policy",
    content: [
      {
        sub: "Permitted Use",
        text: "The Service is intended for use by legitimate home services and remodeling businesses to manage leads, projects, customer relationships, and marketing activities. You agree to use the Service only for lawful business purposes and in accordance with these Terms."
      },
      {
        sub: "Prohibited Activities",
        text: "You may not: (a) use the Service to send spam, unsolicited messages, or communicate with individuals who have opted out; (b) violate any applicable federal, state, or local laws, including the TCPA, CAN-SPAM Act, or GDPR; (c) upload or transmit malicious code, viruses, or any material that could harm the Service or other users; (d) attempt to gain unauthorized access to the Service or its related systems; (e) use the Service to store or transmit illegal content; (f) scrape, crawl, or otherwise harvest data from the Service; (g) resell or sublicense the Service without written permission; or (h) impersonate any person or entity."
      },
      {
        sub: "Compliance with Communication Laws",
        text: "If you use automation or messaging features, you are solely responsible for ensuring compliance with all applicable laws, including the Telephone Consumer Protection Act (TCPA), the CAN-SPAM Act, and applicable state regulations. You must obtain proper consent before sending automated messages."
      }
    ]
  },
  {
    id: "5",
    title: "Intellectual Property",
    content: [
      {
        sub: "Our Intellectual Property",
        text: "The Service, including all software, designs, text, graphics, interfaces, and content created by ClosePro Remodel, is and will remain the exclusive property of ClosePro Remodel and its licensors, protected by US and international intellectual property laws. These Terms do not grant you any right to use ClosePro Remodel's trademarks, logos, or brand features."
      },
      {
        sub: "Your Content",
        text: "You retain all ownership rights in content you upload or create within the Service (\"Your Content\"), including customer data, photos, estimates, and other business materials. By uploading Your Content, you grant ClosePro Remodel a limited, non-exclusive license to store, display, and process Your Content solely as necessary to provide the Service to you."
      },
      {
        sub: "Feedback",
        text: "If you submit ideas, suggestions, or feedback about the Service, you grant ClosePro Remodel a perpetual, irrevocable, royalty-free license to use such feedback for any purpose without compensation or attribution to you."
      }
    ]
  },
  {
    id: "6",
    title: "Data and Privacy",
    content: [
      {
        sub: "Privacy Policy",
        text: "Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices."
      },
      {
        sub: "Customer Data",
        text: "You are the controller of any personal data you collect from your customers through the Service. You are responsible for ensuring you have the necessary rights and consents to upload and process such data, and for complying with all applicable data protection laws with respect to your customers' data."
      },
      {
        sub: "Data Security",
        text: "We implement commercially reasonable security measures to protect data stored in the Service. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
      }
    ]
  },
  {
    id: "7",
    title: "Third-Party Services and Integrations",
    content: [
      {
        sub: "Third-Party Integrations",
        text: "The Service may integrate with or link to third-party services such as Stripe, Google, and others. Your use of such third-party services is governed by their respective terms and privacy policies. ClosePro Remodel is not responsible for the content, policies, or practices of third-party services."
      },
      {
        sub: "AI Features",
        text: "Certain features of the Service are powered by artificial intelligence. AI-generated content, including ad copy, blog posts, and estimates, is provided for informational and productivity purposes only. You are responsible for reviewing, editing, and verifying all AI-generated content before use. ClosePro Remodel makes no warranties about the accuracy or fitness of AI outputs."
      }
    ]
  },
  {
    id: "8",
    title: "Disclaimers and Limitations of Liability",
    content: [
      {
        sub: "Disclaimer of Warranties",
        text: "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. CLOSEPROREMODEL DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE."
      },
      {
        sub: "Limitation of Liability",
        text: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLOSEPROREMODEL AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF REVENUE, PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF CLOSEPROREMODEL HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."
      },
      {
        sub: "Cap on Liability",
        text: "In no event shall ClosePro Remodel's total liability to you for all claims arising out of or related to these Terms or the Service exceed the greater of (a) the total amount you paid to ClosePro Remodel in the 12 months preceding the claim, or (b) $100."
      }
    ]
  },
  {
    id: "9",
    title: "Indemnification",
    content: [
      {
        sub: "Your Indemnification Obligations",
        text: "You agree to defend, indemnify, and hold harmless ClosePro Remodel and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) Your Content; (c) your violation of these Terms; (d) your violation of any third-party rights; or (e) your violation of any applicable law or regulation."
      }
    ]
  },
  {
    id: "10",
    title: "Termination",
    content: [
      {
        sub: "Termination by You",
        text: "You may cancel your subscription at any time through your account settings or by contacting support@closeproremodel.com. Cancellation takes effect at the end of the current billing period. You will retain access to the Service through the end of your paid period."
      },
      {
        sub: "Termination by Us",
        text: "ClosePro Remodel reserves the right to suspend or terminate your account and access to the Service at any time, with or without cause, with or without notice. Grounds for termination include, but are not limited to, violation of these Terms, non-payment, or conduct harmful to other users or the Service."
      },
      {
        sub: "Effect of Termination",
        text: "Upon termination, your right to use the Service will immediately cease. You may request an export of Your Content within 30 days of termination. After 30 days, we may delete Your Content from our systems."
      }
    ]
  },
  {
    id: "11",
    title: "Dispute Resolution",
    content: [
      {
        sub: "Informal Resolution",
        text: "Before filing any formal legal action, you agree to contact us at legal@closeproremodel.com and attempt to resolve the dispute informally. We will attempt to resolve the dispute within 30 days of receipt of your notice."
      },
      {
        sub: "Binding Arbitration",
        text: "If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through binding arbitration under the rules of the American Arbitration Association (AAA), conducted in Austin, Texas. The arbitrator's decision shall be final and binding."
      },
      {
        sub: "Class Action Waiver",
        text: "YOU AGREE THAT ANY CLAIMS WILL BE BROUGHT ON AN INDIVIDUAL BASIS ONLY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION."
      },
      {
        sub: "Governing Law",
        text: "These Terms are governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law principles."
      }
    ]
  },
  {
    id: "12",
    title: "General Provisions",
    content: [
      {
        sub: "Entire Agreement",
        text: "These Terms, together with the Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and ClosePro Remodel regarding the Service and supersede all prior agreements and understandings."
      },
      {
        sub: "Severability",
        text: "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect."
      },
      {
        sub: "Waiver",
        text: "Our failure to enforce any right or provision of these Terms will not constitute a waiver of future enforcement of that right or provision."
      },
      {
        sub: "Contact",
        text: "For questions about these Terms, please contact us at legal@closeproremodel.com or at ClosePro Remodel, 123 Growth Way, Austin, TX 78701."
      }
    ]
  }
];

export default function Terms() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-electric" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-gray-300 max-w-2xl">
            Please read these Terms carefully before using ClosePro Remodel. By using our platform, you agree to be bound by these Terms.
          </p>
          <p className="text-sm text-gray-400">Effective Date: April 1, 2026 &nbsp;|&nbsp; Last Updated: April 28, 2026</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Quick Nav */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16 border border-gray-100">
          <h2 className="font-bold text-navy text-lg mb-4">Table of Contents</h2>
          <ol className="space-y-2 columns-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#section-${s.id}`}
                  className="text-blue-electric hover:underline text-sm font-medium"
                >
                  {s.id}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-14 text-gray-700">
          {SECTIONS.map((section) => (
            <section key={section.id} id={`section-${section.id}`} className="space-y-6 scroll-mt-28">
              <h2 className="text-2xl font-bold text-navy border-b border-gray-100 pb-4">
                {section.id}. {section.title}
              </h2>
              {section.content.map((block, bi) => (
                <div key={bi} className="space-y-2">
                  <h3 className="text-base font-bold text-navy">{block.sub}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{block.text}</p>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Contact Box */}
        <div className="mt-16 p-8 bg-blue-electric/5 border border-blue-electric/20 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold text-navy">Legal Questions?</h3>
          <p className="text-sm text-gray-600">Contact our legal team for questions about these Terms of Service.</p>
          <a href="mailto:legal@closeproremodel.com" className="flex items-center gap-2 text-sm font-bold text-blue-electric hover:underline">
            <Mail size={16} /> legal@closeproremodel.com
          </a>
          <div className="flex gap-4 pt-2">
            <Link to="/privacy" className="text-sm text-blue-electric hover:underline font-medium">
              Privacy Policy →
            </Link>
            <Link to="/contact" className="text-sm text-blue-electric hover:underline font-medium">
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
