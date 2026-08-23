import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Modal } from '../../components/UI/Modal';
import { User } from '../../types';
import { displayName } from '../../lib/constants';
import { buildIntroInquiryDefaults } from '../../lib/introInquiryEmailTemplate';
import { notifyUserIntroInquiry } from '../../lib/notifyUserIntroInquiry';
import { logAuditEventSafe } from '../../lib/auditLog';

type IntroInquiryEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
};

export const IntroInquiryEmailModal: React.FC<IntroInquiryEmailModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !targetUser) return;

    const firstName =
      (targetUser.first_name || '').trim() ||
      (targetUser.name || '').trim().split(/\s+/)[0] ||
      '';
    const defaults = buildIntroInquiryDefaults(firstName);
    setSubject(defaults.subject);
    setBody(defaults.body);
    setError(null);
    setIsSending(false);
  }, [isOpen, targetUser]);

  const handleSend = async () => {
    if (!targetUser) return;

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    if (!trimmedSubject || !trimmedBody) {
      setError('Subject and message are required.');
      return;
    }

    setIsSending(true);
    setError(null);

    const result = await notifyUserIntroInquiry(
      targetUser.id,
      trimmedSubject,
      trimmedBody
    );

    if (!result.ok) {
      setError(result.error || 'Failed to send email. Please try again.');
      setIsSending(false);
      return;
    }

    logAuditEventSafe({
      action: 'email_inquiry',
      category: 'users',
      entityType: 'users',
      entityId: targetUser.id,
      summary: `Sent intro inquiry email to ${targetUser.email || targetUser.id}`,
      details: {
        email: targetUser.email,
        subject: trimmedSubject,
      },
    });

    setIsSending(false);
    alert(`Email sent to ${result.emailed || targetUser.email}.`);
    onClose();
  };

  if (!targetUser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSending) onClose();
      }}
      title="Email signup"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral">
          Sent from the church office. Replies go to{' '}
          <span className="font-medium text-charcoal">
            office@ashburtonbaptist.co.nz
          </span>
          .
        </p>

        <div>
          <label className="block text-sm font-bold text-charcoal mb-1">
            To
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-[4px] px-3 py-2 text-sm text-charcoal">
            {displayName(targetUser)}
            {targetUser.email ? ` · ${targetUser.email}` : ''}
          </div>
        </div>

        <div>
          <label
            htmlFor="intro-inquiry-subject"
            className="block text-sm font-bold text-charcoal mb-1"
          >
            Subject
          </label>
          <input
            id="intro-inquiry-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            maxLength={200}
            className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor="intro-inquiry-body"
            className="block text-sm font-bold text-charcoal mb-1"
          >
            Message
          </label>
          <textarea
            id="intro-inquiry-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending}
            rows={14}
            maxLength={10000}
            className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm text-charcoal font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-y min-h-[220px]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="bg-white border-2 border-gray-200 text-charcoal px-5 py-2.5 rounded-[4px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !subject.trim() || !body.trim()}
            className="bg-gold text-charcoal px-5 py-2.5 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Mail size={18} />
            {isSending ? 'Sending…' : 'Send email'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
