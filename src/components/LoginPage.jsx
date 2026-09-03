import React, { useState, useRef, useEffect } from 'react';
import {
  ThermoGuardLogo,
  ShieldCheckIcon,
  TrendingUpIcon,
  MapPinIcon,
  BellIcon,
  Building2Icon,
  UsersIcon,
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  SmartphoneIcon,
  KeyRoundIcon,
  AlertTriangleIcon,
  CheckIcon,
  LanguagesIcon,
  GlobeIcon
} from './icons';
import { loginWithCredentials } from '../services/authService';
import DepartmentDropdown from './DepartmentDropdown';
import { useLanguage } from '../context/LanguageContext';
import './LoginPage.css';

const AUTHORITY_DEPARTMENTS = [
  'SDMA / Municipal Disaster Control Command',
  'NDMA - National Disaster Management Authority',
  'District Emergency Operation Centre (DEOC)',
  'Public Health & Heat Action Taskforce',
  'IMD Meteorological Duty Desk',
  'Municipal Corporation Health & Sanitation'
];

const CITIZEN_LOCATIONS = [
  'New Delhi (Central / Connaught Place)',
  'Ahmedabad (East / Maninagar)',
  'Nagpur (Civil Lines / Sitabuldi)',
  'Hyderabad (Banjara Hills / Secunderabad)',
  'Varanasi (Dashashwamedh & Godowlia)',
  'Mumbai (Bandra / Suburban Coastal)',
  'Kolkata (Park Street / Salt Lake)',
  'Auto-detect Nearest Ward (GPS Live)'
];

function LoginPage({ onLoginSuccess }) {
  const { currentLang, currentLanguageObj, setLanguage, hasPrompted, markLanguagePrompted, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(() => !hasPrompted);
  const [selectedModalLang, setSelectedModalLang] = useState(() => (currentLang === 'hi' ? 'hi' : 'en'));

  const [role, setRole] = useState('authority'); // 'authority' | 'citizen'
  const [isLoading, setIsLoading] = useState(false);
  const [roleTransitioning, setRoleTransitioning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Authority Form State
  const [authorityForm, setAuthorityForm] = useState({
    officerIdOrEmail: '',
    department: AUTHORITY_DEPARTMENTS[0],
    passcode: '',
    rememberDevice: true,
    showPassword: false
  });

  // Citizen Form State
  const [citizenForm, setCitizenForm] = useState({
    phone: '',
    otpCode: '',
    alertLocation: CITIZEN_LOCATIONS[0],
    alertsOptIn: true
  });

  // OTP Simulation State
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Form Validation Errors
  const [errors, setErrors] = useState({});

  const tabIndicatorRef = useRef(null);
  const authTabRef = useRef(null);
  const publicTabRef = useRef(null);

  // Update sliding tab indicator position
  useEffect(() => {
    const activeBtn = role === 'authority' ? authTabRef.current : publicTabRef.current;
    if (activeBtn && tabIndicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeBtn;
      tabIndicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      tabIndicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [role]);

  // Handle countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Clear errors when switching role or mode
  const handleSwitchRole = (newRole) => {
    if (newRole === role) return;
    setRoleTransitioning(true);
    setRole(newRole);
    setErrors({});
    setStatusMessage(null);
    setTimeout(() => {
      setRoleTransitioning(false);
    }, 280);
  };

  // Handle OTP Trigger Simulation
  const handleSendOtp = () => {
    const phoneClean = citizenForm.phone.replace(/[^0-9]/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Please enter a valid 10-digit mobile number first'
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, phone: null }));
    setOtpSent(true);
    setOtpTimer(30);
    // Generate a friendly 6-digit mock OTP and prefill/notify
    const generatedOtp = '849201';
    setCitizenForm((prev) => ({ ...prev, otpCode: generatedOtp }));
    setStatusMessage({
      type: 'success',
      text: `OTP sent successfully to +91 ${phoneClean.slice(0, 5)} ${phoneClean.slice(5)}. Verification Code: ${generatedOtp}`
    });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // Authority Form Submit
  const handleAuthoritySubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!authorityForm.officerIdOrEmail.trim()) {
      newErrors.officerIdOrEmail = 'Officer ID or Official Email is required';
    }
    if (!authorityForm.passcode.trim()) {
      newErrors.passcode = 'Authorized passcode is required';
    } else if (authorityForm.passcode.length < 4) {
      newErrors.passcode = 'Passcode must be at least 4 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const user = await loginWithCredentials({
        role: 'authority',
        officerIdOrEmail: authorityForm.officerIdOrEmail,
        department: authorityForm.department,
        rememberDevice: authorityForm.rememberDevice
      });
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Authority login error:', err);
      setErrors({ general: 'Authentication failed. Please verify credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Citizen Form Submit
  const handleCitizenSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    const phoneClean = citizenForm.phone.replace(/[^0-9]/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!citizenForm.otpCode.trim()) {
      newErrors.otpCode = 'Please enter the 6-digit OTP received';
    } else if (citizenForm.otpCode.trim().length < 4) {
      newErrors.otpCode = 'Enter a valid verification OTP';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const user = await loginWithCredentials({
        role: 'citizen',
        phoneOrEmail: citizenForm.phone,
        alertLocation: citizenForm.alertLocation,
        alertsOptIn: citizenForm.alertsOptIn
      });
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Citizen login error:', err);
      setErrors({ general: 'Login failed. Please check your inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`thermoguard-login-screen role-${role}`}>
      {/* 1. New User Language Selection Pop-up Modal (Hindi and English) */}
      {showLangModal && (
        <div
          className="login-lang-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-lang-modal-title"
        >
          <div className="login-lang-modal-card">
            <div className="login-lang-modal-header">
              <div className="login-lang-modal-icon-badge">
                <LanguagesIcon size={28} color="#2563eb" />
              </div>
              <h2 id="login-lang-modal-title" className="login-lang-modal-title">
                {selectedModalLang === 'hi' ? 'वेबसाइट भाषा चुनें' : 'Select Website Language'}
              </h2>
              <p className="login-lang-modal-sub">
                {selectedModalLang === 'hi'
                  ? 'थर्मोगार्ड पोर्टल का उपयोग करने के लिए अपनी पसंदीदा भाषा चुनें:'
                  : 'Choose your preferred website language to proceed:'}
              </p>
            </div>

            <div className="login-lang-options-grid">
              {/* Hindi Option */}
              <button
                type="button"
                className={`login-lang-card ${selectedModalLang === 'hi' ? 'selected' : ''}`}
                onClick={() => setSelectedModalLang('hi')}
                aria-pressed={selectedModalLang === 'hi'}
              >
                <div className="lang-card-top">
                  <span className="lang-card-flag">🇮🇳</span>
                  <span className="lang-card-badge">हिन्दी</span>
                  <div className={`lang-card-radio ${selectedModalLang === 'hi' ? 'checked' : ''}`}>
                    {selectedModalLang === 'hi' && <span className="radio-dot" />}
                  </div>
                </div>
                <div className="lang-card-name">हिन्दी (Hindi)</div>
                <p className="lang-card-desc">
                  सभी मौसम चेतावनियां, लाइव टेलीमेट्री और कार्ययोजनाएं हिन्दी में देखें।
                </p>
              </button>

              {/* English Option */}
              <button
                type="button"
                className={`login-lang-card ${selectedModalLang === 'en' ? 'selected' : ''}`}
                onClick={() => setSelectedModalLang('en')}
                aria-pressed={selectedModalLang === 'en'}
              >
                <div className="lang-card-top">
                  <span className="lang-card-flag">🌐</span>
                  <span className="lang-card-badge">English</span>
                  <div className={`lang-card-radio ${selectedModalLang === 'en' ? 'checked' : ''}`}>
                    {selectedModalLang === 'en' && <span className="radio-dot" />}
                  </div>
                </div>
                <div className="lang-card-name">English</div>
                <p className="lang-card-desc">
                  Access real-time heat telemetry, biometeorological alerts, and action plans in English.
                </p>
              </button>
            </div>

            <div className="login-lang-modal-footer">
              <button
                type="button"
                className="login-lang-confirm-btn"
                onClick={() => {
                  setLanguage(selectedModalLang);
                  markLanguagePrompted();
                  setShowLangModal(false);
                }}
              >
                <span>{selectedModalLang === 'hi' ? 'आगे बढ़ें (Continue)' : 'Continue'}</span>
                <ArrowRightIcon size={18} />
              </button>
              <p className="login-lang-hint">
                {selectedModalLang === 'hi'
                  ? '💡 सूचना: आप हेडर में दिए गए भाषा आइकन से कभी भी 8 क्षेत्रीय भाषाओं में बदल सकते हैं।'
                  : '💡 Tip: You can switch between 8 Indian regional languages anytime from the header language icon.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Split Left Hero Section */}
      <section className="login-hero-side">
        {/* Background Atmosphere Layers */}
        <div className="hero-skyline-bg" />
        <div className="hero-atmosphere-glow" />
        <div className="hero-radar-rings">
          <div className="radar-ring ring-1" />
          <div className="radar-ring ring-2" />
          <div className="radar-ring ring-3" />
          <div className="radar-sun-core" />
        </div>
        <div className="hero-wave-lines" />

        {/* Hero Content Container */}
        <div className="hero-content-wrapper">
          {/* Top Brand Logo */}
          <div className="hero-brand-header">
            <div className="hero-logo-box">
              <ThermoGuardLogo size={38} />
            </div>
            <div className="hero-brand-text">
              <span className="brand-name">{t('appName', 'THERMOGUARD')}</span>
              <span className="brand-tagline">{t('appTagline', 'Extreme Heat Early Warning System')}</span>
            </div>
          </div>

          {/* Main Headline & Description */}
          <div className="hero-headline-block">
            <h1 className="hero-title">
              {t('login_hero_title1', 'Forecasting')}{' '}
              <span className="text-heat-gradient">{t('login_hero_title2', 'Extreme Heat.')}</span>
              <br />
              {t('login_hero_title3', 'Saving Lives.')}
            </h1>
            <p className="hero-subtitle">
              {t('login_hero_desc', 'AI-powered biometeorological intelligence for early heatwave detection, human thermal stress mapping, and hyper-local civic protection.')}
            </p>
          </div>

          {/* 4 Core Capabilities Badges */}
          <div className="hero-features-list">
            <div className="hero-feature-card feat-predictions">
              <div className="feature-icon-box orange">
                <TrendingUpIcon size={20} color="#ea580c" />
              </div>
              <div className="feature-text">
                <strong>Smart Predictions</strong>
                <span>3–5 day early warnings using advanced AI models</span>
              </div>
            </div>

            <div className="hero-feature-card feat-insights">
              <div className="feature-icon-box amber">
                <MapPinIcon size={20} color="#d97706" />
              </div>
              <div className="feature-text">
                <strong>Hyper-local Insights</strong>
                <span>Ward level risk mapping and impact forecasting</span>
              </div>
            </div>

            <div className="hero-feature-card feat-health">
              <div className="feature-icon-box emerald">
                <ShieldCheckIcon size={20} color="#16a34a" />
              </div>
              <div className="feature-text">
                <strong>Health Impact Focused</strong>
                <span>Human thermal stress index &amp; mortality risk estimation</span>
              </div>
            </div>

            <div className="hero-feature-card feat-alerts">
              <div className="feature-icon-box purple">
                <BellIcon size={20} color="#7c3aed" />
              </div>
              <div className="feature-text">
                <strong>Actionable Alerts</strong>
                <span>Automated alerts &amp; recommendations for authorities and citizens</span>
              </div>
            </div>
          </div>

          {/* Bottom Pledge Badge */}
          <div className="hero-bottom-pill">
            <div className="pill-shield-icon">
              <ShieldCheckIcon size={16} color="#ffffff" />
            </div>
            <span>Together, let's build a heat-resilient India.</span>
          </div>
        </div>
      </section>

      {/* Split Right Auth Section */}
      <section className="login-auth-side">
        {/* Quick Language Switcher on Login Screen */}
        <button
          type="button"
          className="login-lang-trigger-btn"
          onClick={() => {
            setSelectedModalLang(currentLang === 'hi' ? 'hi' : 'en');
            setShowLangModal(true);
          }}
          title="Change Website Language / भाषा बदलें"
          aria-label="Change Website Language"
        >
          <LanguagesIcon size={16} color="#2563eb" />
          <span>{currentLang === 'hi' ? 'हिन्दी (Hindi)' : currentLanguageObj?.name || 'English'}</span>
        </button>

        {/* Central Auth Container */}
        <div className="auth-form-card">
          {/* Card Header */}
          <div className="auth-card-header">
            <h2 className="auth-welcome-title">
              {role === 'authority' ? t('login_tab_authority', 'Authority Portal') : t('login_tab_citizen', 'Citizen Heat Safety')}
            </h2>
            <p className="auth-welcome-desc">
              {role === 'authority'
                ? t('login_auth_badge', 'Sign in to access disaster command desk, ward GIS & alert dispatch')
                : t('login_cit_badge', 'Sign in to monitor live thermal stress, find cooling centers & get alerts')}
            </p>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`auth-status-toast ${statusMessage.type} animate-fade-in`}>
              <CheckIcon size={15} color="#16a34a" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* General Error Notice */}
          {errors.general && (
            <div className="auth-error-banner animate-fade-in">
              <AlertTriangleIcon size={16} color="#dc2626" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Role Navigation Switcher Tabs */}
          <div className="role-nav-tabs" role="tablist">
            <div ref={tabIndicatorRef} className={`role-tab-indicator ${role}`} />

            <button
              ref={authTabRef}
              type="button"
              role="tab"
              aria-selected={role === 'authority'}
              className={`role-tab-btn ${role === 'authority' ? 'active authority' : ''}`}
              onClick={() => handleSwitchRole('authority')}
            >
              <Building2Icon size={18} />
              <span>{t('login_tab_authority', 'Authority Login')}</span>
            </button>

            <button
              ref={publicTabRef}
              type="button"
              role="tab"
              aria-selected={role === 'citizen'}
              className={`role-tab-btn ${role === 'citizen' ? 'active citizen' : ''}`}
              onClick={() => handleSwitchRole('citizen')}
            >
              <UsersIcon size={18} />
              <span>{t('login_tab_citizen', 'Citizen Login')}</span>
            </button>
          </div>

          {/* Dynamic Content: Authority Form vs Citizen Form */}
          <div className={`role-context-panel ${roleTransitioning ? 'transitioning' : 'visible'}`}>
            {role === 'authority' ? (
              /* AUTHORITY LOGIN FORM */
              <form className="auth-inputs-form" onSubmit={handleAuthoritySubmit} noValidate>
                {/* Field 1: Officer ID / Official Email */}
                <div className="auth-form-group">
                  <label htmlFor="auth-officer-id" className="auth-field-label">
                    <span>{t('login_field_officerId', 'Officer ID / Official Govt Email')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className={`auth-input-wrapper ${errors.officerIdOrEmail ? 'has-error' : ''}`}>
                    <span className="auth-input-icon">
                      <MailIcon size={17} color="#64748b" />
                    </span>
                    <input
                      id="auth-officer-id"
                      type="text"
                      className="auth-text-input"
                      placeholder={t('login_field_officerId_ph', 'e.g. officer4102@gov.in or AUTH-9921')}
                      value={authorityForm.officerIdOrEmail}
                      onChange={(e) => {
                        setAuthorityForm((prev) => ({ ...prev, officerIdOrEmail: e.target.value }));
                        if (errors.officerIdOrEmail) setErrors((prev) => ({ ...prev, officerIdOrEmail: null }));
                      }}
                      autoComplete="username"
                    />
                  </div>
                  {errors.officerIdOrEmail && (
                    <span className="auth-field-error-msg">{errors.officerIdOrEmail}</span>
                  )}
                </div>

                {/* Field 2: Department / Jurisdiction Selector */}
                <div className="auth-form-group dept-select-group">
                  <label htmlFor="auth-department" className="auth-field-label">
                    <span>{t('login_field_department', 'Jurisdiction / Department')}</span>
                  </label>
                  <DepartmentDropdown
                    id="auth-department"
                    options={AUTHORITY_DEPARTMENTS}
                    value={authorityForm.department}
                    icon={<Building2Icon size={17} color="#64748b" />}
                    accentColor="authority"
                    onChange={(deptName) =>
                      setAuthorityForm((prev) => ({ ...prev, department: deptName }))
                    }
                  />
                </div>

                {/* Field 3: Official Passcode */}
                <div className="auth-form-group">
                  <div className="auth-label-row">
                    <label htmlFor="auth-passcode" className="auth-field-label">
                      <span>{t('login_field_passcode', 'Confidential Passcode')}</span>
                      <span className="required-star">*</span>
                    </label>
                    <button
                      type="button"
                      className="auth-label-link-btn"
                      onClick={() =>
                        setStatusMessage({
                          type: 'info',
                          text: 'For authorization recovery, contact your State Disaster Management IT Cell.'
                        })
                      }
                    >
                      Forgot Passcode?
                    </button>
                  </div>
                  <div className={`auth-input-wrapper ${errors.passcode ? 'has-error' : ''}`}>
                    <span className="auth-input-icon">
                      <LockIcon size={17} color="#64748b" />
                    </span>
                    <input
                      id="auth-passcode"
                      type={authorityForm.showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder={t('login_field_passcode_ph', 'Enter your access passcode')}
                      value={authorityForm.passcode}
                      onChange={(e) => {
                        setAuthorityForm((prev) => ({ ...prev, passcode: e.target.value }));
                        if (errors.passcode) setErrors((prev) => ({ ...prev, passcode: null }));
                      }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle-btn"
                      onClick={() =>
                        setAuthorityForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                      }
                      title={authorityForm.showPassword ? 'Hide passcode' : 'Show passcode'}
                      aria-label="Toggle password visibility"
                    >
                      {authorityForm.showPassword ? (
                        <EyeOffIcon size={17} color="#64748b" />
                      ) : (
                        <EyeIcon size={17} color="#64748b" />
                      )}
                    </button>
                  </div>
                  {errors.passcode && (
                    <span className="auth-field-error-msg">{errors.passcode}</span>
                  )}
                </div>

                {/* Field 4: Remember Device Checkbox */}
                <div className="auth-checkbox-group">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={authorityForm.rememberDevice}
                      onChange={(e) =>
                        setAuthorityForm((prev) => ({ ...prev, rememberDevice: e.target.checked }))
                      }
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">{t('login_field_remember', 'Authorized terminal (keep 24-hour command session)')}</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`auth-primary-submit-btn authority-accent ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-loading-state">
                      <span className="btn-spinner" />
                      <span>{t('refreshing', 'Entering Authority Portal...')}</span>
                    </span>
                  ) : (
                    <span className="btn-label-state">
                      <span>{t('login_btn_auth', 'Enter Authority Portal')}</span>
                      <ArrowRightIcon size={18} />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* CITIZEN LOGIN FORM */
              <form className="auth-inputs-form" onSubmit={handleCitizenSubmit} noValidate>
                {/* Mobile Number Input with Country Code & Get OTP Button */}
                <div className="auth-form-group">
                  <label htmlFor="citizen-phone" className="auth-field-label">
                    <span>{t('login_field_phone', 'Mobile Phone Number')}</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className={`auth-input-wrapper phone-wrapper ${errors.phone ? 'has-error' : ''}`}>
                    <div className="phone-country-tag">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      id="citizen-phone"
                      type="tel"
                      className="auth-text-input phone-input"
                      placeholder={t('login_field_phone_ph', '98765 43210')}
                      maxLength={10}
                      value={citizenForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCitizenForm((prev) => ({ ...prev, phone: val }));
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      autoComplete="tel"
                    />
                    <button
                      type="button"
                      className={`send-otp-action-btn ${otpTimer > 0 ? 'disabled' : ''}`}
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0}
                    >
                      {otpTimer > 0 ? `${t('login_btn_resend_otp', 'Resend in')} ${otpTimer}s` : otpSent ? t('login_btn_resend_otp', 'Resend OTP') : t('login_btn_send_otp', 'Get OTP')}
                    </button>
                  </div>
                  {errors.phone && (
                    <span className="auth-field-error-msg">{errors.phone}</span>
                  )}
                </div>

                {/* 6-Digit OTP Field */}
                <div className="auth-form-group">
                  <div className="auth-label-row">
                    <label htmlFor="citizen-otp" className="auth-field-label">
                      <span>{t('login_field_otp', '6-Digit Verification OTP')}</span>
                      <span className="required-star">*</span>
                    </label>
                    {otpSent && (
                      <span className="otp-hint-badge">
                        <CheckIcon size={12} color="#16a34a" />
                        <span>OTP Active</span>
                      </span>
                    )}
                  </div>
                  <div className={`auth-input-wrapper ${errors.otpCode ? 'has-error' : ''}`}>
                    <span className="auth-input-icon">
                      <KeyRoundIcon size={17} color="#64748b" />
                    </span>
                    <input
                      id="citizen-otp"
                      type="text"
                      className="auth-text-input otp-input"
                      placeholder={t('login_field_otp_ph', 'Enter 6-digit code (Use 123456 for demo)')}
                      maxLength={6}
                      value={citizenForm.otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCitizenForm((prev) => ({ ...prev, otpCode: val }));
                        if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: null }));
                      }}
                      autoComplete="one-time-code"
                    />
                  </div>
                  {errors.otpCode && (
                    <span className="auth-field-error-msg">{errors.otpCode}</span>
                  )}
                </div>

                {/* Primary Alert City / Zone Selector */}
                <div className="auth-form-group loc-select-group">
                  <label htmlFor="citizen-location" className="auth-field-label">
                    <span>{t('login_field_location', 'Primary Heat Alert Zone')}</span>
                  </label>
                  <DepartmentDropdown
                    id="citizen-location"
                    options={CITIZEN_LOCATIONS}
                    value={citizenForm.alertLocation}
                    icon={<MapPinIcon size={17} color="#64748b" />}
                    accentColor="citizen"
                    onChange={(locName) =>
                      setCitizenForm((prev) => ({ ...prev, alertLocation: locName }))
                    }
                  />
                </div>

                {/* WhatsApp / SMS Heatwave Alert Opt-In */}
                <div className="auth-checkbox-group">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={citizenForm.alertsOptIn}
                      onChange={(e) =>
                        setCitizenForm((prev) => ({ ...prev, alertsOptIn: e.target.checked }))
                      }
                    />
                    <span className="checkbox-custom citizen" />
                    <span className="checkbox-text">
                      {t('login_field_optin', 'Send extreme heat warnings to my WhatsApp & SMS alerts')}
                    </span>
                  </label>
                </div>

                {/* Citizen Submit Button */}
                <button
                  type="submit"
                  className={`auth-primary-submit-btn citizen-accent ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-loading-state">
                      <span className="btn-spinner" />
                      <span>{t('refreshing', 'Entering Citizen Portal...')}</span>
                    </span>
                  ) : (
                    <span className="btn-label-state">
                      <span>{t('login_btn_cit', 'Enter Citizen Portal')}</span>
                      <ArrowRightIcon size={18} />
                    </span>
                  )}
                </button>

              </form>
            )}
          </div>

          {/* Quick Switch / Sign Up Footer */}
          <div className="auth-signup-footer">
            <span>
              {role === 'authority'
                ? 'Need official department authorization? '
                : 'Need community heatwave assistance? '}
            </span>
            <button
              type="button"
              className="signup-link-btn"
              onClick={() => {
                setStatusMessage({
                  type: 'info',
                  text: role === 'authority'
                    ? 'Contact National Disaster Management Authority (NDMA) support cell at support@ndma.gov.in'
                    : 'Call Toll-Free Civic Heatline 1070 or visit your nearest Emergency Cooling Shelter'
                });
                setTimeout(() => setStatusMessage(null), 6000);
              }}
            >
              {role === 'authority' ? 'Contact SDMA Desk' : 'Emergency Help Directory'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
