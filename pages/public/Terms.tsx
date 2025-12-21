import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';

export const Terms = () => {
  return (
    <div className="pb-32">
      <PageHeader title="TERMS & CONDITIONS" subtitle="Legal" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl">
        <div className="glass-card rounded-[8px] p-8 md:p-12 bg-white/80">
          <div className="prose prose-lg max-w-none">
            <p className="text-neutral text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">1. Acceptance of Terms</h2>
              <p className="text-neutral leading-relaxed mb-4">
                By accessing and using the Ashburton Baptist Church website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">2. Use License</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on Ashburton Baptist Church's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">3. Member Portal Access</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Access to the member portal is restricted to approved members of Ashburton Baptist Church. By accessing the member portal, you agree to:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the portal only for church-related purposes</li>
                <li>Not share your account access with unauthorized individuals</li>
                <li>Respect the privacy of other members' information</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">4. User Content</h2>
              <p className="text-neutral leading-relaxed mb-4">
                You are responsible for any content you post, including prayer requests, comments, or other submissions. You agree not to post content that:
              </p>
              <ul className="list-disc list-inside text-neutral space-y-2 mb-4 ml-4">
                <li>Is defamatory, abusive, or hateful</li>
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes on the rights of others</li>
                <li>Contains confidential information about others without consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">5. Disclaimer</h2>
              <p className="text-neutral leading-relaxed mb-4">
                The materials on Ashburton Baptist Church's website are provided on an 'as is' basis. Ashburton Baptist Church makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">6. Limitations</h2>
              <p className="text-neutral leading-relaxed mb-4">
                In no event shall Ashburton Baptist Church or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if Ashburton Baptist Church or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">7. Revisions</h2>
              <p className="text-neutral leading-relaxed mb-4">
                Ashburton Baptist Church may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-6">8. Contact Information</h2>
              <p className="text-neutral leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us at:
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

