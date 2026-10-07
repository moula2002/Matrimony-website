import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, faEnvelope, faPhoneAlt, faChevronDown, 
  faChevronUp, faPaperPlane, faSpinner, faCommentAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

const FAQS = [
  {
    q: "How do I create a matrimony profile?",
    a: "You can register by providing your email, phone number, and building your partner preferences during onboarding. Once completed, your profile will be listed in matches."
  },
  {
    q: "What is a premium membership and how do I upgrade?",
    a: "Premium memberships allow you to view complete profiles (like college, income, family financial status) and connect/chat/call directly with matching partners. Click 'Go Premium' on the profile page to view packages."
  },
  {
    q: "How can I block or report a user?",
    a: "Go to the profile page of the user you want to block, click the options menu (dots) in the corner, and select 'Block User' or 'Report Profile'."
  },
  {
    q: "How do I edit my partner preferences?",
    a: "Go to your Profile tab, click 'Partner Preferences' or click 'Edit Preferences' on your feed sidebar to adjust age range, location, caste, and religion filters."
  }
];

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Support Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess('');
    try {
      // Simulate/call support endpoint or log it
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Your support ticket has been submitted. Our team will contact you shortly!');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto lg:mx-0 lg:ml-6 xl:ml-10 space-y-8 lg:px-8">
        
        {/* Title Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-[#5D34F7] animate-pulse" />
              <span>Help Center</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">
              Browse FAQs, submit support queries, or reach out to our administration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quick Contacts */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2">
                Quick Contacts
              </h3>
              
              <div className="space-y-3.5 text-xs text-slate-600 font-bold">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5D34F7]/10 text-[#5D34F7] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <span className="text-slate-450 block font-semibold text-[10px]">Email Support</span>
                    <a href="mailto:support@familiessmatrimony.com" className="hover:text-[#5D34F7]">support@familiessmatrimony.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5D34F7]/10 text-[#5D34F7] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                  </div>
                  <div>
                    <span className="text-slate-450 block font-semibold text-[10px]">Hotline support</span>
                    <span>+1 (800) 555-0199</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5D34F7]/5 to-[#4024DB]/5 border border-[#5D34F7]/10 rounded-3xl p-6 text-xs text-slate-650 font-bold space-y-2">
              <h4 className="font-black text-slate-800 text-sm">Need Premium Help?</h4>
              <p className="leading-relaxed">Premium members get dedicated accounts managers to help find matching partners faster and perform verification checks.</p>
            </div>
          </div>

          {/* FAQS & Support Form */}
          <div className="md:col-span-2 space-y-6">
            
            {/* FAQs Accordion */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                      <button 
                        onClick={() => toggleFaq(index)}
                        className="w-full flex justify-between items-center px-4 py-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50/50 transition cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-slate-400" />
                      </button>
                      
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-[11px] text-slate-500 font-semibold leading-relaxed border-t border-slate-100 mt-0.5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCommentAlt} className="text-[#5D34F7]" />
                Send Support Query
              </h3>
              
              <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-2">
                  <label className="block text-slate-500">Query Subject</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., Subscription issue, Account setup..."
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500">Message Description</label>
                  <textarea 
                    rows="4"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type details of your issue or feedback..."
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D34F7]/25 focus:border-[#5D34F7] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5D34F7] to-[#4024DB] hover:opacity-95 text-white text-[11px] font-black rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  {sending ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Message
                    </>
                  )}
                </button>
                
                {success && <p className="text-[11px] text-emerald-600 font-bold mt-2">{success}</p>}
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
