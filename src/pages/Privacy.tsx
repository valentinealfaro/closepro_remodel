import { Link } from 'react-router-dom';
import { Shield, Mail, Phone } from 'lucide-react';

const SECTIONS = [
  {
    id: "1",
    title: "Information We Collect",
    content: [
      {
        sub: "Information You Provide",
        text: "We collect information you provide directly when you create an account, book a demo, submit a contact form, or communicate with us. This includes: full name, business name, email address, phone number, mailing address, billing and payment information (processed securely through Stripe), and any messages or files you send to us."
      },
      {
        sub: "Information We Collect Automatically",
        text: "When you visit our website or use the ClosePro Remodel platform, we automatically collect certain technical information, including: IP address, browser type and version, operating system, referring URLs, pages visited and time spent, device identifiers, and log data associated with your use of our services."
      },
      {
        sub: "Information from Third Parties",
        text: "We may receive information about you from third-party services such as Google (when you use Google Sign-In), Stripe (payment processing), and analytics providers. We handle all such data in accordance with this Privacy Policy."
      },
      {
        sub: "Information You Upload",
        text: "As part of using the platform, you may upload project photos, customer information, contract documents, and other business data. You retain ownership of all such content, and we process it solely to provide the services described in our Terms of Service."
      }
    ]
  },
  {
    id: "2",
    title: "How We Use Your Information",
    content: [
      {
        sub: "Providing and Improving Our Services",
        text: "We use your information to create and maintain your account, deliver the features and functionality of the ClosePro Remodel platform, process transactions, send transactional communications (receipts, alerts, confirmations), and improve, customize, and develop new features."
      },
      {
        sub: "Communications",
        text: "We may use your contact information to send you product updates, security notices, support messages, and marketing communications. You can opt out of marketing emails at any time using the unsubscribe link in any email or by contacting us directly."
      },
      {
        sub: "Analytics and Research",
        text: "We use aggregated and anonymized data to analyze trends, understand how users interact with our platform, and measure the effectiveness of our marketing. This data cannot be used to identify individual users."
      },
      {
        sub: "Legal and Safety",
        text: "We may use your information to comply with applicable laws, respond to legal process or government requests, enforce our Terms of Service, protect the rights and safety of ClosePro Remodel, our users, and the public."
      }
    ]
  },
  {
    id: "3",
    title: "How We Share Your Information",
    content: [
      {
        sub: "We Do Not Sell Your Data",
        text: "ClosePro Remodel does not sell, rent, or trade your personal information to third parties for their marketing purposes. Period."
      },
      {
        sub: "Service Providers",
        text: "We share information with trusted third-party vendors who assist us in operating our platform, including: Stripe (payment processing), Firebase/Google Cloud (hosting and database), SendGrid or similar providers (email delivery), and analytics tools. These vendors are contractually obligated to use your data only to provide services to us and in accordance with this policy."
      },
      {
        sub: "Business Transfers",
        text: "If ClosePro Remodel is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email or prominent notice on our website before your information becomes subject to a different privacy policy."
      },
      {
        sub: "Legal Requirements",
        text: "We may disclose your information if required to do so by law or in the good-faith belief that such disclosure is necessary to comply with a legal obligation, protect and defend our rights, prevent fraud, or protect the safety of our users."
      }
    ]
  },
  {
    id: "4",
    title: "Data Security",
    content: [
      {
        sub: "Our Security Practices",
        text: "We implement industry-standard security measures to protect your information, including: SSL/TLS encryption for all data in transit, AES-256 encryption for data at rest, role-based access controls limiting employee access to personal data, regular security audits and penetration testing, and secure payment processing through PCI-DSS compliant Stripe."
      },
      {
        sub: "Your Responsibilities",
        text: "You are responsible for maintaining the security of your account credentials. Please use a strong, unique password and do not share your login information with others. If you believe your account has been compromised, contact us immediately at security@closeproremodel.com."
      },
      {
        sub: "Breach Notification",
        text: "In the event of a data breach that affects your personal information, we will notify you and relevant regulatory authorities as required by applicable law, no later than 72 hours after becoming aware of the breach."
      }
    ]
  },
  {
    id: "5",
    title: "Cookies and Tracking Technologies",
    content: [
      {
        sub: "Types of Cookies We Use",
        text: "We use the following types of cookies: Essential cookies (required for the platform to function, such as session tokens and authentication), Performance cookies (to analyze how visitors use our website via tools like Google Analytics), Functional cookies (to remember your preferences and personalize your experience), and Marketing cookies (to deliver relevant advertisements and track campaign effectiveness)."
      },
      {
        sub: "Managing Cookies",
        text: "You can control and/or delete cookies as you wish using your browser settings. Disabling certain cookies may impact your ability to use some features of our platform. You may also opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on."
      }
    ]
  },
  {
    id: "6",
    title: "Your Rights and Choices",
    content: [
      {
        sub: "Access and Portability",
        text: "You have the right to request a copy of the personal information we hold about you. We will provide this data in a structured, machine-readable format within 30 days of a valid request."
      },
      {
        sub: "Correction",
        text: "You may update or correct inaccurate personal information directly in your account settings, or by contacting us at privacy@closeproremodel.com."
      },
      {
        sub: "Deletion",
        text: "You may request deletion of your personal information at any time by contacting us. We will fulfill deletion requests within 30 days, subject to our legal obligation to retain certain records (such as billing history) for a minimum period required by law."
      },
      {
        sub: "Opt-Out of Marketing",
        text: "You can opt out of receiving marketing emails at any time by clicking the 'Unsubscribe' link in any email or by contacting us at privacy@closeproremodel.com. Note that you will still receive transactional messages related to your account."
      },
      {
        sub: "California Residents (CCPA)",
        text: "California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to deletion, and the right to opt-out of the sale of personal information. We do not sell personal information. To exercise your CCPA rights, contact us at privacy@closeproremodel.com."
      }
    ]
  },
  {
    id: "7",
    title: "Data Retention",
    content: [
      {
        sub: "How Long We Keep Your Data",
        text: "We retain your personal information for as long as your account is active or as needed to provide you services. If you cancel your account, we will delete or anonymize your personal data within 90 days, except for information we are required to retain for legal or compliance purposes (such as billing records, which are retained for 7 years as required by tax law)."
      }
    ]
  },
  {
    id: "8",
    title: "International Data Transfers",
    content: [
      {
        sub: "Transfer Mechanisms",
        text: "ClosePro Remodel is based in the United States. If you are accessing our services from outside the United States, your data will be transferred to, processed, and stored in the United States. By using our services, you consent to this transfer. We rely on Standard Contractual Clauses and other approved mechanisms to ensure adequate data protection for international transfers."
      }
    ]
  },
  {
    id: "9",
    title: "Children's Privacy",
    content: [
      {
        sub: "Age Restriction",
        text: "ClosePro Remodel is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will take steps to delete such information."
      }
    ]
  },
  {
    id: "10",
    title: "Changes to This Policy",
    content: [
      {
        sub: "Policy Updates",
        text: "We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (to the address on file) and/or by posting a prominent notice on our website at least 30 days before the changes take effect. Your continued use of the platform after the effective date of any changes constitutes your acceptance of the updated policy."
      }
    ]
  },
  {
    id: "11",
    title: "Contact Us",
    content: [
      {
        sub: "Privacy Inquiries",
        text: "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Team at: Email: privacy@closeproremodel.com | Phone: (800) 555-0123 | Address: ClosePro Remodel, 123 Growth Way, Austin, TX 78701. We aim to respond to all privacy inquiries within 5 business days."
      }
    ]
  }
];

export default function Privacy() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-electric" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-300 max-w-2xl">
            We take your privacy seriously. This policy explains exactly what data we collect, how we use it, and your rights regarding your information.
          </p>
          <p className="text-sm text-gray-400">Effective Date: April 1, 2026 &nbsp;|&nbsp; Last Updated: April 28, 2026</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Quick Nav */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16 border border-gray-100">
          <h2 className="font-bold text-navy text-lg mb-4">Table of Contents</h2>
          <ol className="space-y-2">
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
          <h3 className="text-xl font-bold text-navy">Questions About Your Privacy?</h3>
          <p className="text-sm text-gray-600">Our team is here to help you understand and exercise your rights.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:privacy@closeproremodel.com" className="flex items-center gap-2 text-sm font-bold text-blue-electric hover:underline">
              <Mail size={16} /> privacy@closeproremodel.com
            </a>
            <a href="tel:+18005550123" className="flex items-center gap-2 text-sm font-bold text-blue-electric hover:underline">
              <Phone size={16} /> (800) 555-0123
            </a>
          </div>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-sm">
            Contact Our Privacy Team
          </Link>
        </div>
      </div>
    </div>
  );
}
