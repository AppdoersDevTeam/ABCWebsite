import React, { useRef, useState } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { submitContactForm } from '../../lib/submitContactForm';
import {
  getStep1SummaryError,
  validateStep1Fields,
  type Step1Field,
  type Step1FieldErrors,
} from '../../lib/validateContactFields';
import { sanitizePhoneInput } from '../../lib/validatePhone';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowDownToLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

const AGE_BRACKETS = ['20+', '30+', '40+', '50+', '60+'] as const;

const STEPS = [
  { id: 1, title: 'Your Details', subtitle: 'Tell us how to reach you' },
  { id: 2, title: 'How We Can Help', subtitle: 'Let us know what interests you' },
  { id: 3, title: 'Finish Up', subtitle: 'Share anything else on your heart' },
] as const;

const initialChildren = [
  { name: '', age: '' },
  { name: '', age: '' },
  { name: '', age: '' },
];

const initialFormData = {
  firstName: '',
  lastName: '',
  spouseFirstName: '',
  spouseLastName: '',
  ageBracket: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  children: initialChildren,
  firstTimeVisitor: false,
  beenBefore: false,
  committedToJesus: false,
  recommittedToJesus: false,
  wantConnectGroup: false,
  interestedInBaptism: false,
  talkToPastor: false,
  wantNewsletter: false,
  wantMembership: false,
  wantVolunteer: false,
  knowMoreAbout: '',
  prayerRequest: '',
};

type FormData = typeof initialFormData;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gold text-white shadow-lg shadow-gold/30 scale-110'
                      : isComplete
                        ? 'bg-gold/20 text-gold border-2 border-gold'
                        : 'bg-gray-100 text-neutral border-2 border-gray-200'
                  }`}
                >
                  {isComplete ? <Check size={18} /> : step.id}
                </div>
                <span
                  className={`mt-2 text-xs font-bold uppercase tracking-wider hidden sm:block truncate w-full ${
                    isActive ? 'text-gold' : 'text-neutral'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 max-w-16 mb-6 transition-colors duration-300 ${
                    currentStep > step.id ? 'bg-gold' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-center text-neutral text-sm mt-4 sm:hidden">
        Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
      </p>
    </div>
  );
}

function OptionCard({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-[12px] border cursor-pointer transition-all duration-200 ${
        checked
          ? 'border-gold bg-gold/10 shadow-sm'
          : 'border-gray-200/80 bg-white/60 hover:border-gold/40 hover:bg-white'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
          checked ? 'bg-gold border-gold text-white' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </div>
      <span className="text-sm text-charcoal leading-snug">{label}</span>
    </label>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[12px] border border-gray-200/80 overflow-hidden bg-white/40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left group"
      >
        <div>
          <h4 className="font-serif text-lg text-charcoal group-hover:text-gold transition-colors">
            {title}
          </h4>
          {subtitle && <p className="text-xs text-neutral mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown
          className={`text-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-4 space-y-6 border-t border-gray-100">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InterestGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gold">{title}</h4>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function FormField({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {children}
      {error && <p className="text-xs text-red-600 px-1">{error}</p>}
    </div>
  );
}

function fieldInputClass(hasError: boolean): string {
  return `w-full p-4 rounded-[8px] input-sun${hasError ? ' border-2 border-red-400 focus:border-red-500' : ''}`;
}

export const Contact = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Step1FieldErrors>({});

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as Step1Field];
        return next;
      });
    }
  };

  const updateChild = (index: number, field: 'name' | 'age', value: string) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  const validateStep1 = (): boolean => {
    const errors = validateStep1Fields({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(getStep1SummaryError(errors));
      return false;
    }

    setFieldErrors({});
    setError(null);
    return true;
  };

  const goNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    // Defer so the Continue click doesn't land on the Submit button when step changes.
    window.setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    }, 0);
  };

  const goBack = () => {
    setError(null);
    window.setTimeout(() => {
      setCurrentStep((s) => Math.max(s - 1, 1));
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentStep < STEPS.length) {
      goNext();
      return;
    }

    if (honeypot.trim()) return;
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        spouseFirstName: formData.spouseFirstName.trim(),
        spouseLastName: formData.spouseLastName.trim(),
        ageBracket: formData.ageBracket,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        children: formData.children,
        firstTimeVisitor: formData.firstTimeVisitor,
        beenBefore: formData.beenBefore,
        committedToJesus: formData.committedToJesus,
        recommittedToJesus: formData.recommittedToJesus,
        wantConnectGroup: formData.wantConnectGroup,
        interestedInBaptism: formData.interestedInBaptism,
        talkToPastor: formData.talkToPastor,
        wantNewsletter: formData.wantNewsletter,
        wantMembership: formData.wantMembership,
        wantVolunteer: formData.wantVolunteer,
        knowMoreAbout: formData.knowMoreAbout.trim(),
        prayerRequest: formData.prayerRequest.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(true);
      setFormData(initialFormData);
      setFieldErrors({});
      setCurrentStep(1);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      console.error('Error submitting contact form:', err);
      setError('Failed to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepMeta = STEPS[currentStep - 1];

  return (
    <div className="space-y-0 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/ABC background01.png"
            alt="Ashburton Baptist Church"
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gray-700/45" />
        </div>

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1
                className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"
                style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}
              >
                Connect
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Get in Touch.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">
                  We'd love to hear from you
                </span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">
                  and answer any questions you may have.
                </span>
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-10">
              <MessageSquare className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">
                Get in Touch
              </h2>
              <p className="text-gold mt-2 text-base font-bold">We'd love to hear from you.</p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: <MapPin />,
                title: 'Visit',
                val: '284 Havelock Street, Ashburton 7700',
                id: 'visit',
              },
              { icon: <Phone />, title: 'Call', val: '03-308 5409', id: 'call' },
              {
                icon: <Mail />,
                title: 'Email',
                val: 'office@ashburtonbaptist.co.nz',
                id: 'email',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.id} direction="up" delay={i * 80}>
                <div
                  id={item.id}
                  className="glass-card bg-white/70 border border-white/50 shadow-sm p-5 flex flex-col items-center text-center gap-3 rounded-[16px] hover:border-gold transition-all duration-300 group hover:shadow-lg scroll-mt-24"
                >
                  <div className="p-3 bg-gold/10 rounded-full text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
                    {React.cloneElement(item.icon, { size: 22 })}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-charcoal mb-1 group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-neutral text-sm break-words">{item.val}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up" delay={200}>
            <div
              id="message"
              className="glass-card bg-white/70 p-6 md:p-10 rounded-[16px] scroll-mt-24 border border-white/50 shadow-sm"
            >
              <div className="text-center mb-2">
                <h3 className="text-3xl font-serif font-normal text-charcoal">Connect With Us</h3>
                <p className="text-gold text-sm font-bold mt-1">How can we help?</p>
              </div>

              {success && (
                <div className="mt-6 p-4 rounded-[8px] bg-green-50 border border-green-200 text-green-800 text-center">
                  Thank you! Your message has been sent. We will get back to you soon.
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-[8px] bg-red-50 border border-red-200 text-red-800 text-center">
                  {error}
                </div>
              )}

              <form className="mt-8" onSubmit={handleSubmit} noValidate>
                <input
                  type="text"
                  name="_honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden
                />

                <StepIndicator currentStep={currentStep} />

                <div className="mb-8 text-center">
                  <h4 className="text-xl font-serif text-charcoal">{currentStepMeta.title}</h4>
                  <p className="text-sm text-neutral mt-1">{currentStepMeta.subtitle}</p>
                </div>

                {/* Step 1: Contact details */}
                {currentStep === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField error={fieldErrors.firstName}>
                        <input
                          type="text"
                          placeholder="FIRST NAME *"
                          className={fieldInputClass(Boolean(fieldErrors.firstName))}
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          aria-invalid={Boolean(fieldErrors.firstName)}
                        />
                      </FormField>
                      <FormField error={fieldErrors.lastName}>
                        <input
                          type="text"
                          placeholder="LAST NAME *"
                          className={fieldInputClass(Boolean(fieldErrors.lastName))}
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          aria-invalid={Boolean(fieldErrors.lastName)}
                        />
                      </FormField>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField error={fieldErrors.phone}>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="MOBILE NUMBER"
                          className={fieldInputClass(Boolean(fieldErrors.phone))}
                          value={formData.phone}
                          onChange={(e) => updateField('phone', sanitizePhoneInput(e.target.value))}
                          aria-invalid={Boolean(fieldErrors.phone)}
                        />
                        {!fieldErrors.phone && (
                          <p className="text-xs text-neutral px-1">
                            Optional — e.g. 021 123 4567 or +64 21 123 4567
                          </p>
                        )}
                      </FormField>
                      <FormField error={fieldErrors.email}>
                        <input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="EMAIL *"
                          className={fieldInputClass(Boolean(fieldErrors.email))}
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          aria-invalid={Boolean(fieldErrors.email)}
                        />
                      </FormField>
                    </div>

                    <CollapsibleSection
                      title="Additional details"
                      subtitle="Optional — spouse, age, address & children"
                    >
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Spouse
                        </span>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="FIRST NAME"
                            className="w-full p-4 rounded-[8px] input-sun"
                            value={formData.spouseFirstName}
                            onChange={(e) => updateField('spouseFirstName', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="LAST NAME"
                            className="w-full p-4 rounded-[8px] input-sun"
                            value={formData.spouseLastName}
                            onChange={(e) => updateField('spouseLastName', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Age
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {AGE_BRACKETS.map((bracket) => (
                            <button
                              key={bracket}
                              type="button"
                              onClick={() =>
                                updateField(
                                  'ageBracket',
                                  formData.ageBracket === bracket ? '' : bracket
                                )
                              }
                              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                formData.ageBracket === bracket
                                  ? 'bg-gold text-white shadow-md'
                                  : 'bg-gray-100 text-charcoal hover:bg-gold/20 hover:text-gold'
                              }`}
                            >
                              {bracket}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Address
                        </span>
                        <input
                          type="text"
                          placeholder="ADDRESS LINE 1"
                          className="w-full p-4 rounded-[8px] input-sun"
                          value={formData.addressLine1}
                          onChange={(e) => updateField('addressLine1', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="ADDRESS LINE 2"
                          className="w-full p-4 rounded-[8px] input-sun"
                          value={formData.addressLine2}
                          onChange={(e) => updateField('addressLine2', e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                          Children
                        </span>
                        {formData.children.map((child, index) => (
                          <div key={index} className="grid grid-cols-[1fr_72px] gap-3">
                            <input
                              type="text"
                              placeholder={`Child ${index + 1} name`}
                              className="w-full p-3 rounded-[8px] input-sun text-sm"
                              value={child.name}
                              onChange={(e) => updateChild(index, 'name', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Age"
                              className="w-full p-3 rounded-[8px] input-sun text-sm"
                              value={child.age}
                              onChange={(e) => updateChild(index, 'age', e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    <p className="text-xs text-neutral text-center">* Required fields</p>
                  </div>
                )}

                {/* Step 2: Interests */}
                {currentStep === 2 && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <InterestGroup title="Visitor Status">
                      <OptionCard
                        id="firstTimeVisitor"
                        label="1st Time Visitor"
                        checked={formData.firstTimeVisitor}
                        onChange={(checked) => updateField('firstTimeVisitor', checked)}
                      />
                      <OptionCard
                        id="beenBefore"
                        label="I've Been Before"
                        checked={formData.beenBefore}
                        onChange={(checked) => updateField('beenBefore', checked)}
                      />
                    </InterestGroup>

                    <InterestGroup title="Start">
                      <OptionCard
                        id="committedToJesus"
                        label="I have committed my life to Jesus"
                        checked={formData.committedToJesus}
                        onChange={(checked) => updateField('committedToJesus', checked)}
                      />
                      <OptionCard
                        id="recommittedToJesus"
                        label="I've recommitted my life to Jesus"
                        checked={formData.recommittedToJesus}
                        onChange={(checked) => updateField('recommittedToJesus', checked)}
                      />
                    </InterestGroup>

                    <InterestGroup title="Next Step">
                      <OptionCard
                        id="wantConnectGroup"
                        label="I want to join a Connect Group"
                        checked={formData.wantConnectGroup}
                        onChange={(checked) => updateField('wantConnectGroup', checked)}
                      />
                      <OptionCard
                        id="interestedInBaptism"
                        label="I'm interested in being baptised"
                        checked={formData.interestedInBaptism}
                        onChange={(checked) => updateField('interestedInBaptism', checked)}
                      />
                      <OptionCard
                        id="talkToPastor"
                        label="I would like to talk to a Pastor"
                        checked={formData.talkToPastor}
                        onChange={(checked) => updateField('talkToPastor', checked)}
                      />
                      <OptionCard
                        id="wantNewsletter"
                        label="I want to receive a weekly newsletter"
                        checked={formData.wantNewsletter}
                        onChange={(checked) => updateField('wantNewsletter', checked)}
                      />
                    </InterestGroup>

                    <InterestGroup title="Get Involved">
                      <OptionCard
                        id="wantMembership"
                        label="I want to become a member"
                        checked={formData.wantMembership}
                        onChange={(checked) => updateField('wantMembership', checked)}
                      />
                      <OptionCard
                        id="wantVolunteer"
                        label="I want to volunteer for a ministry"
                        checked={formData.wantVolunteer}
                        onChange={(checked) => updateField('wantVolunteer', checked)}
                      />
                    </InterestGroup>

                    <p className="text-xs text-neutral text-center">
                      All options are optional — select any that apply to you.
                    </p>
                  </div>
                )}

                {/* Step 3: Messages */}
                {currentStep === 3 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="space-y-2">
                      <label
                        htmlFor="knowMoreAbout"
                        className="text-xs font-bold uppercase tracking-wider text-charcoal"
                      >
                        I'd Like to Know More About
                      </label>
                      <textarea
                        id="knowMoreAbout"
                        rows={4}
                        placeholder="Tell us what you'd like to learn more about..."
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.knowMoreAbout}
                        onChange={(e) => updateField('knowMoreAbout', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="prayerRequest"
                        className="text-xs font-bold uppercase tracking-wider text-charcoal"
                      >
                        Prayer Request
                      </label>
                      <textarea
                        id="prayerRequest"
                        rows={4}
                        placeholder="Share your prayer request..."
                        className="w-full p-4 rounded-[8px] input-sun"
                        value={formData.prayerRequest}
                        onChange={(e) => updateField('prayerRequest', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200/60 max-w-2xl mx-auto">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1 text-charcoal hover:text-gold font-bold text-sm transition-colors"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < STEPS.length ? (
                    <GlowingButton
                      type="button"
                      size="lg"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        goNext();
                      }}
                      className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight size={18} />
                    </GlowingButton>
                  ) : (
                    <GlowingButton
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </GlowingButton>
                  )}
                </div>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
