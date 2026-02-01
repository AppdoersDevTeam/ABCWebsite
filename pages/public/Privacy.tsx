import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';

export const Privacy = () => {
  return (
    <div className="pb-32">
      <PageHeader title="PRIVACY POLICY" subtitle="Your Privacy Matters" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl">
        <div className="glass-card rounded-[8px] p-8 md:p-12 bg-white/80">
          <div className="prose prose-lg max-w-none">
            <p className="text-neutral text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">1. Introduction</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Ashburton Baptist Church ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our member portal.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">2. Information We Collect</h2>
              <h3 className="text-xl font-bold text-charcoal mb-4 mt-6">2.1 Personal Information</h3>
              <p className="text-neutral leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Register for a member account</li>
                <li>Submit prayer requests</li>
                <li>Contact us through our website</li>
                <li>Subscribe to our newsletter</li>
                <li>Make donations or contributions</li>
              </ul>
              <p className="text-neutral leading-relaxed mb-4">
                This information may include your name, email address, phone number, mailing address, and other contact details.
              </p>

              <h3 className="text-xl font-bold text-charcoal mb-4 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-neutral leading-relaxed mb-4">
                When you visit our website, we may automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">3. How We Use Your Information</h2>
              <p className="text-neutral leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your member account registration and manage your access to the member portal</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you newsletters, updates, and other communications</li>
                <li>Process donations and contributions</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">4. Information Sharing and Disclosure</h2>
              <p className="text-neutral leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li><strong>With Your Consent:</strong> We may share your information when you have given us explicit consent to do so</li>
                <li><strong>Service Providers:</strong> We may share information with trusted service providers who assist us in operating our website and conducting our ministry</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
                <li><strong>Church Directory:</strong> Approved members may have limited information displayed in the member directory, which is only accessible to other approved members</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">5. Prayer Requests</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Prayer requests submitted through our website may be shared with church leadership and, if you consent, with the broader church community through the prayer wall. You may request that your prayer request remain confidential and only be shared with pastors.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">6. Data Security</h2>
              <p className="text-neutral leading-relaxed mb-4">
                We implement appropriate technical and organisational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">7. Your Rights</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Under New Zealand privacy law, you have the right to:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Withdraw consent at any time where we rely on consent to process your information</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">8. Cookies and Tracking Technologies</h2>
              <p className="text-neutral leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">9. Children's Privacy</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">10. Changes to This Privacy Policy</h2>
              <p className="text-neutral leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-normal text-charcoal mb-6">11. Contact Us</h2>
              <p className="text-neutral leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-[8px] border border-gray-100">
                <p className="text-charcoal font-bold mb-2">Ashburton Baptist Church</p>
                <p className="text-neutral">284 Havelock Street, Ashburton 7700</p>
                <p className="text-neutral">Phone: <a href="tel:03-308-5409" className="text-gold hover:underline">03-308 5409</a></p>
                <p className="text-neutral">Email: <a href="mailto:office@ashburtonbaptist.co.nz" className="text-gold hover:underline">office@ashburtonbaptist.co.nz</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};


