import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | VibeShack Studios',
  description: 'Complete Terms of Service for VibeShack Studios. Comprehensive legal agreement covering bookings, cancellations, liability, content rights, and dispute resolution.',
};

export default function TermsProfessionalPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm mb-2"><strong>VibeShack Studios, Inc.</strong></p>
          <p className="text-gray-500 text-sm">950 Battery Street, San Francisco, CA 94111</p>
          <p className="text-gray-600 text-xs mt-4">Last Updated: April 4, 2026 | Effective Date: April 4, 2026</p>
        </div>

        {/* Legal Content */}
        <div className="prose prose-invert max-w-none 
          prose-h2:text-white prose-h2:font-black prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-2xl
          prose-h3:text-gray-100 prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-lg
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:mb-3 prose-li:ml-2
          prose-strong:text-white prose-strong:font-bold
          prose-a:text-brand-red hover:prose-a:text-white
          prose-blockquote:border-l-brand-red prose-blockquote:text-gray-400
          prose-code:text-gray-200 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded">

          {/* RECITALS */}
          <section>
            <h2>RECITALS</h2>
            <p>
              <strong>WHEREAS,</strong> VibeShack Studios, Inc. ("Company," "Studio," "we," "us," or "our") operates professional production and rental studios located in San Francisco, California; and
            </p>
            <p>
              <strong>WHEREAS,</strong> you ("User," "you," or "your") desire to rent studio space, production services, or equipment from the Company;
            </p>
            <p>
              <strong>NOW, THEREFORE,</strong> in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:
            </p>
          </section>

          {/* SECTION 1 */}
          <section>
            <h2>1. DEFINED TERMS</h2>
            <ul>
              <li><strong>Booking</strong> — A confirmed reservation for studio space, services, or equipment made through the Studio's booking system, confirmed upon receipt of full payment.</li>
              <li><strong>Content</strong> — All photography, video, audio, and other creative works produced, recorded, or created during your session.</li>
              <li><strong>Equipment</strong> — All cameras, microphones, lighting, teleprompters, furniture, fixtures, and other items provided by the Studio.</li>
              <li><strong>Event</strong> — A force majeure event, including acts of God, pandemics, war, government action, terrorism, strikes, or natural disasters.</li>
              <li><strong>Guest</strong> — Any individual invited by you to attend your session, including production crew, talent, or observers.</li>
              <li><strong>Session</strong> — The period of time during which you are authorized to occupy and use the Studio.</li>
              <li><strong>Services</strong> — The provision of studio space, equipment, and optional services (cameraman, crew, teleprompter operation, etc.).</li>
              <li><strong>Studio</strong> — The physical production facility at 950 Battery Street, San Francisco, CA 94111, including all studios, equipment, and related facilities.</li>
            </ul>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2>2. SCOPE OF SERVICES &amp; STUDIO DESCRIPTION</h2>
            <h3>2.1 Studio Services</h3>
            <p>The Studio provides access to professional production spaces, equipment, and optional support services. The Studio consists of multiple distinct studios, each configured for specific production types.</p>
            
            <h3>2.2 Equipment Provision</h3>
            <p>All Equipment is provided as part of your rental, including studio cameras, lighting systems, microphones, audio interfaces, green screen, cyc walls, and miscellaneous production gear.</p>
            
            <h3>2.3 Optional Services</h3>
            <p>Additional services are available for additional fees: cameraman/camera operation, audio engineering, teleprompter operation, editing consultation, hair &amp; makeup facilities, and crew assistance. Optional services are provided on a first-come, first-served basis. Availability is not guaranteed.</p>
            
            <h3>2.4 Service Limitations</h3>
            <p><strong>The Studio operates as a rental facility, not a full-service production house.</strong></p>
            <p>The Studio provides: studio space access, basic Equipment setup and operation, and technical support for Equipment.</p>
            <p>The Studio does NOT provide: creative direction, post-production editing, content editing or creative guidance, talent or performer services, insurance for your Content or personal property, or professional production management.</p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2>3. USER OBLIGATIONS &amp; CONDUCT</h2>
            <h3>3.1 Professional Use Only</h3>
            <p>You agree to use the Studio solely for lawful, professional purposes. You shall not use the Studio for illegal purposes, create unlawful content, engage in harassment, conduct surveillance, or produce pornographic or adult content.</p>
            
            <h3>3.2 Age of Majority</h3>
            <p>You represent and warrant that you are at least 18 years of age. If you are under 18, a parent or legal guardian must be present during your entire session.</p>
            
            <h3>3.3 Safety &amp; Health</h3>
            <p>If you or any Guest is experiencing illness, contagious symptoms, or has been exposed to contagious disease, you must reschedule your session. All Guests must comply with safety instructions provided by the Studio.</p>
            
            <h3>3.4 Equipment Responsibility</h3>
            <p>You are responsible for proper handling of all Equipment. Misuse, intentional damage, recklessness, or theft will result in full repair/replacement charges and potential criminal prosecution. Do not remove Equipment without written authorization.</p>
            
            <h3>3.5 Guest Management</h3>
            <p>Only Guests explicitly approved or listed at booking are permitted. Unauthorized persons will be asked to leave. You are liable for the conduct of all Guests and for any damage caused by Guests.</p>
            
            <h3>3.6 Property &amp; Cleanliness</h3>
            <p>You must leave the Studio in the condition you found it. Excessive cleanup requirements result in cleaning fees ($150–$500+, depending on severity).</p>
            
            <h3>3.7 Compliance with Law</h3>
            <p>You shall comply with all applicable federal, state, and local laws, including copyright, privacy, labor, building code, and San Francisco municipal ordinances.</p>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2>4. PROHIBITED USE</h2>
            <p>You shall not, and shall ensure your Guests do not:</p>
            <ul>
              <li><strong>Illegal Activity</strong> — Use the Studio for any illegal purpose</li>
              <li><strong>Harmful Content</strong> — Create content that is defamatory, obscene, or promotes violence</li>
              <li><strong>Discrimination &amp; Harassment</strong> — Engage in discrimination, harassment, bullying, or hate speech</li>
              <li><strong>IP Infringement</strong> — Produce content that infringes intellectual property without proper licensing</li>
              <li><strong>Privacy Violation</strong> — Record individuals without informed consent</li>
              <li><strong>Malicious Use</strong> — Attempt to damage, disrupt, hack, or sabotage Studio systems</li>
              <li><strong>Unauthorized Commercial Use</strong> — Use beyond the scope of your booking authorization</li>
              <li><strong>Prohibited Substances</strong> — Bring illegal drugs, alcohol without authorization, etc.</li>
              <li><strong>Smoking &amp; Open Flame</strong> — Strictly prohibited</li>
              <li><strong>Weapons</strong> — Not permitted without prior written authorization</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2>5. BOOKING, PAYMENT &amp; CANCELLATION</h2>
            <h3>5.1 Booking Process</h3>
            <p>Bookings are confirmed upon: selection of studio, date, and time; completion of booking details; full payment via Stripe; and automatic confirmation email.</p>
            
            <h3>5.2 Availability</h3>
            <p>Availability shown in the booking system is in real-time but subject to system latency. Bookings are processed on a first-come, first-served basis.</p>
            
            <h3>5.3 Session Duration &amp; Checkout</h3>
            <p>Sessions must begin and end within the booked time slot. Extended sessions beyond the booked time are subject to overage charges at 1.5x the standard hourly rate.</p>
            
            <h3>5.4 Payment Terms</h3>
            <p>Full payment is required at booking. Payment is accepted via Stripe. Payment is non-refundable except as stated in Section 5.7.</p>
            
            <h3>5.5 Pricing</h3>
            <p>Hourly rates are listed on the website. Rates include studio access and standard Equipment setup. Optional add-ons are charged separately. All prices exclude sales tax.</p>
            
            <h3>5.6 Recurring Booking Discounts</h3>
            <ul>
              <li><strong>Weekly recurring:</strong> 10% discount on base rate</li>
              <li><strong>Bi-weekly recurring:</strong> 7% discount on base rate</li>
              <li><strong>Monthly (4+ sessions):</strong> 5% discount on base rate</li>
              <li>Discounts apply to studio rental only, not add-ons</li>
              <li>Discounts require prepayment for the full recurring period</li>
            </ul>
            
            <h3>5.7 Cancellation Policy</h3>
            <ul>
              <li><strong>Full Refund:</strong> Cancellations 48+ hours before session start = 100% refund</li>
              <li><strong>Partial Refund:</strong> Cancellations 24–48 hours before = 50% refund; Rescheduling with 48+ hours notice = No charge</li>
              <li><strong>No Refund:</strong> Cancellations less than 48 hours before, no-shows = No refund</li>
              <li><strong>Studio-Initiated Cancellations:</strong> If the Studio must cancel, you receive full refund OR rescheduling to alternative time</li>
            </ul>
            
            <h3>5.8 Rescheduling</h3>
            <p>Rescheduling requests must be submitted 48+ hours before the session. Rescheduling with 48+ hours notice is free. Rescheduling with less than 48 hours notice incurs a $25 fee.</p>
            
            <h3>5.9 No-Shows &amp; Late Cancellations</h3>
            <p>No-shows forfeit 100% of fees. Cancellations within 48 hours forfeit 100% of fees.</p>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2>6. WARRANTIES, DISCLAIMERS &amp; LIMITATION OF LIABILITY</h2>
            <h3>6.1 DISCLAIMERS: AS-IS SERVICE</h3>
            <p><strong className="text-brand-red">THE STUDIO IS PROVIDED "AS-IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</strong></p>
            
            <h3>6.1.1 Disclaimers of Warranty</h3>
            <ul>
              <li><strong>No Warranty of Merchantability</strong> — The Studio is not fit for any particular purpose or merchantable quality</li>
              <li><strong>No Warranty of Fitness</strong> — The Studio does not meet your specific needs or expectations</li>
              <li><strong>No Warranty of Title</strong> — Equipment is not free from liens or claims</li>
              <li><strong>No Warranty of Non-Infringement</strong> — Services do not infringe third-party IP rights</li>
              <li><strong>No Warranty of Uninterrupted Service</strong> — Equipment or connectivity may fail without notice</li>
            </ul>
            
            <h3>6.1.2 Assumption of Risk</h3>
            <p><strong>YOU ASSUME ALL RISKS</strong> associated with Studio use, including: equipment malfunction, loss or damage to personal property, loss of Content, injury or death, property damage, power outages, environmental conditions, and health hazards.</p>
            
            <h3>6.2 LIMITATION OF LIABILITY</h3>
            <p><strong className="text-brand-red">NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES,</strong> including lost profits, lost data, lost opportunity, lost business, or cost of substitute services.</p>
            
            <h3>6.3 CAP ON LIABILITY</h3>
            <p><strong className="text-brand-red">THE STUDIO'S TOTAL LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID FOR THE SESSION(S), CAPPED AT $1,000.</strong></p>
            
            <h3>6.4–6.7 Additional Disclaimers</h3>
            <p>Equipment is provided as-is without warranty of performance. The Studio is not responsible for Content quality or loss. Internet, power, and utilities are not guaranteed. Studio facility conditions are as-is.</p>
          </section>

          {/* SECTION 7 */}
          <section>
            <h2>7. INDEMNIFICATION</h2>
            <h3>7.1 Indemnification by You</h3>
            <p><strong className="text-brand-red">YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS THE STUDIO</strong> from any claims, losses, damages, or expenses arising from:</p>
            <ul>
              <li>Your use or misuse of the Studio</li>
              <li>Your breach of these Terms</li>
              <li>Your Content, including IP infringement or defamation claims</li>
              <li>Injury or property damage caused by you or your Guests</li>
              <li>Your violation of law or third-party rights</li>
            </ul>
            
            <h3>7.2 Indemnification Procedure</h3>
            <p>The Studio will notify you of claims. You will assume defense and control, with the Studio's right to participate with counsel at your expense. You will not settle without Studio's written consent.</p>
            
            <h3>7.3 Survival</h3>
            <p>Your indemnification obligation survives termination of these Terms.</p>
          </section>

          {/* SECTION 8 */}
          <section>
            <h2>8. INTELLECTUAL PROPERTY &amp; CONTENT RIGHTS</h2>
            <h3>8.1 Your Content Ownership</h3>
            <p>All Content created during your session is your property. You retain all copyrights. The Studio makes no claims to your Content.</p>
            
            <h3>8.2 Studio's Right to Use for Marketing</h3>
            <p><strong>UNLESS YOU EXPLICITLY OPT-OUT IN WRITING AT BOOKING,</strong> the Studio may photograph or video-record your session and use Content for promotional purposes, including website, social media, and marketing materials.</p>
            <p><strong>Opting out does NOT change your session fee.</strong> Studio promotional use does NOT include commercial resale or third-party licensing.</p>
            
            <h3>8.3 Scope of Marketing Rights</h3>
            <p>Marketing rights are limited to: non-exclusive use, promotional purposes only, Studio's own channels, indefinite duration (but you may request removal anytime).</p>
            <p>Studio may NOT commercially license, use for endorsement, misrepresent, or use in defamatory ways.</p>
            
            <h3>8.4 Copyrighted Material &amp; Licensing</h3>
            <p>You are solely responsible for obtaining rights to third-party content (music, footage, images, scripts). <strong>The Studio is not liable for copyright infringement claims.</strong></p>
            
            <h3>8.5 Third-Party Appearances &amp; Privacy</h3>
            <p>If your Content includes individuals, <strong>you are responsible for obtaining informed written consent.</strong> The Studio is not liable for privacy violations or consent issues.</p>
            
            <h3>8.6 Studio Intellectual Property</h3>
            <p>All Studio systems, software, logos, and branding are the Studio's property. You may not copy or reverse-engineer Studio IP.</p>
          </section>

          {/* SECTION 9 */}
          <section>
            <h2>9. INSURANCE &amp; LIABILITY FOR DAMAGE</h2>
            <h3>9.1 Property Damage Assessment</h3>
            <p>If damage occurs, the Studio will assess and provide a repair/replacement estimate. Damage costs will be invoiced within 7 days.</p>
            
            <h3>9.2 Damage Charges Schedule</h3>
            <ul>
              <li>Minor scuffs/marks: $25–$75</li>
              <li>Moderate Equipment damage: $150–$1,000+</li>
              <li>Major Equipment damage: $1,000–$5,000+</li>
              <li>Structural damage: $500–$5,000+</li>
              <li>Theft/removal: Full replacement + $500 penalty</li>
              <li>Deep cleaning: $200–$500+</li>
            </ul>
            
            <h3>9.3 Dispute of Damage Charges</h3>
            <p>Disputes must be submitted within 7 days. Payment is not waived during dispute resolution.</p>
            
            <h3>9.4 Insurance</h3>
            <p>The Studio does not require damage deposits. <strong>You are responsible for obtaining your own liability and equipment insurance.</strong></p>
          </section>

          {/* SECTIONS 10-16 */}
          <section>
            <h2>10. CONFIDENTIALITY</h2>
            <p>Your personal information will be kept confidential. The Studio may disclose information as required by law with notice where possible.</p>
          </section>

          <section>
            <h2>11. TERM &amp; TERMINATION</h2>
            <p>Your booking term begins at session start and ends at session end. The Studio may immediately terminate if you violate these Terms, engage in unlawful conduct, damage Equipment, or create a safety hazard.</p>
            <p>Sections 7 (Indemnification), 8 (IP), 9 (Damage), and 13 (Dispute Resolution) survive termination.</p>
          </section>

          <section>
            <h2>12. FORCE MAJEURE</h2>
            <p>The Studio is not liable for failure to perform due to Force Majeure Events (acts of God, pandemics, war, strikes, internet outages, etc.).</p>
            <p>In the event of Force Majeure affecting your session, the Studio may: refund all fees, OR reschedule to a future date, at Studio's sole discretion.</p>
          </section>

          <section>
            <h2>13. DISPUTE RESOLUTION</h2>
            <h3>13.1 Informal Resolution</h3>
            <p>Email founder@vibeshackstudios.com with dispute details. The Studio will respond within 14 days.</p>
            
            <h3>13.2 Binding Arbitration</h3>
            <p><strong>ANY DISPUTE SHALL BE RESOLVED BY BINDING ARBITRATION, NOT LITIGATION.</strong></p>
            <ul>
              <li><strong>Location:</strong> San Francisco, California</li>
              <li><strong>Rules:</strong> JAMS Comprehensive Arbitration Rules</li>
              <li><strong>Costs:</strong> Each party bears its own costs; arbitrator fees split equally</li>
              <li><strong>Finality:</strong> Arbitrator's decision is final and binding</li>
            </ul>
            
            <h3>13.3 Class Action Waiver</h3>
            <p><strong>YOU AGREE THAT ARBITRATION SHALL BE CONDUCTED ON AN INDIVIDUAL BASIS.</strong> You may not bring class action claims.</p>
            
            <h3>13.4 Statute of Limitations</h3>
            <p>All claims must be brought within 1 year of the incident date. Claims after 1 year are permanently barred.</p>
          </section>

          <section>
            <h2>14. GENERAL PROVISIONS</h2>
            <h3>14.1 Notices</h3>
            <p><strong>Notices to the Studio:</strong> founder@vibeshackstudios.com or 950 Battery Street, San Francisco, CA 94111</p>
            <p><strong>Notices to You:</strong> Email to the address on file in your booking</p>
            
            <h3>14.2 Governing Law</h3>
            <p>These Terms are governed by California law, without regard to conflicts of law principles. Exclusive jurisdiction and venue are in San Francisco, California.</p>
            
            <h3>14.3 Severability</h3>
            <p>If any provision is invalid, it will be modified or severed. All other provisions remain in effect.</p>
            
            <h3>14.4 Waiver</h3>
            <p>No waiver is effective unless in writing and signed. Waiver of one right does not waive other rights.</p>
            
            <h3>14.5 Assignment</h3>
            <p>You may not assign these Terms without written consent. The Studio may assign to successors or affiliates.</p>
            
            <h3>14.6 No Third-Party Beneficiaries</h3>
            <p>These Terms are between you and the Studio only. No third party has enforcement rights.</p>
            
            <h3>14.7–14.12 Additional Provisions</h3>
            <p>Headings are for convenience. These Terms constitute the entire agreement and supersede prior understandings. The Studio may modify Terms with 30 days' written notice for material changes. Confidentiality and indemnification survive termination.</p>
          </section>

          <section>
            <h2>15. ACCESSIBILITY &amp; COMPLIANCE</h2>
            <h3>15.1 ADA Compliance</h3>
            <p>The Studio complies with the Americans with Disabilities Act. Reasonable accommodations are available upon request.</p>
            
            <h3>15.2 California Consumer Privacy Act (CCPA)</h3>
            <p>Your personal information is collected for booking, payment, and customer service. See our Privacy Policy for full disclosure.</p>
            
            <h3>15.3 California Consumer Rights</h3>
            <p>You have the right to access, delete, and opt-out of data sale. For CCPA requests, email founder@vibeshackstudios.com with subject line "CCPA REQUEST."</p>
          </section>

          <section>
            <h2>16. CONTACT INFORMATION</h2>
            <p>
              <strong>VibeShack Studios, Inc.</strong><br />
              950 Battery Street<br />
              San Francisco, CA 94111<br />
              United States<br />
              <br />
              <strong>Email:</strong> founder@vibeshackstudios.com<br />
              <strong>Website:</strong> https://www.vibeshackstudios.com<br />
              <strong>Hours:</strong> 24/7 (by appointment)
            </p>
          </section>

          {/* ACKNOWLEDGMENT */}
          <section className="mt-16 pt-12 border-t border-gray-700">
            <h2>ACKNOWLEDGMENT</h2>
            <p>
              BY BOOKING A SESSION OR USING THE STUDIO, YOU ACKNOWLEDGE THAT:
            </p>
            <ul>
              <li>You have read and understood these Terms</li>
              <li>You agree to be bound by these Terms</li>
              <li>You represent that you are 18+ years of age</li>
              <li>You have the authority to enter into this agreement</li>
            </ul>
            
            <p className="text-center text-gray-600 text-xs mt-12 pt-8 border-t border-gray-800">
              <strong>Last Updated: April 4, 2026</strong><br /><br />
              <em>This Terms of Service is provided for general informational purposes. While drafted to comply with California law, you should consult with a licensed attorney for your specific needs.</em>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
