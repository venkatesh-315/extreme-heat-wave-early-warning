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
  CheckCircleIcon
} from './icons';
import { quickLoginByRole } from '../services/authService';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('authority'); // 'authority' | 'citizen'
  const [isLoading, setIsLoading] = useState(false);
  const [roleTransitioning, setRoleTransitioning] = useState(false);
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

  // Role switch handler with animation trigger
  const handleSwitchRole = (newRole) => {
    if (newRole === role) return;
    setRoleTransitioning(true);
    setRole(newRole);
    setTimeout(() => {
      setRoleTransitioning(false);
    }, 280);
  };

  // Direct login simulator
  const handleLogin = async (selectedRole = role) => {
    setIsLoading(true);
    try {
      // Simulate authenticating session
      await new Promise((resolve) => setTimeout(resolve, 400));
      const user = await quickLoginByRole(selectedRole);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`thermoguard-login-screen role-${role}`}>
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
              <ThermoGuardLogo size={36} />
            </div>
            <div className="hero-brand-text">
              <span className="brand-name">THERMOGUARD</span>
              <span className="brand-tagline">Extreme Heat Early Warning System</span>
            </div>
          </div>

          {/* Main Headline & Description */}
          <div className="hero-headline-block">
            <h1 className="hero-title">
              Forecasting <span className="text-heat-gradient">Extreme Heat.</span>
              <br />
              Protecting Every Life.
            </h1>
            <p className="hero-subtitle">
              AI-powered biometeorological intelligence for early heatwave detection, human thermal stress mapping, and hyper-local civic protection.
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
        {/* Central Auth Container */}
        <div className="auth-form-card">
          {/* Card Header */}
          <div className="auth-card-header">
            <h2 className="auth-welcome-title">Welcome Back!</h2>
            <p className="auth-welcome-desc">Sign in to access your ThermoGuard dashboard</p>
          </div>

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
              <span>Authority Login</span>
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
              <span>Citizen Login</span>
            </button>
          </div>

          {/* Dynamic Role Info Card with Animated Switch */}
          <div className={`role-context-panel ${roleTransitioning ? 'transitioning' : 'visible'}`}>
            {role === 'authority' ? (
              <div className="role-info-card authority animate-role-card">
                <div className="role-header-line">
                  <span className="role-badge authority">MUNICIPAL &amp; DISASTER AUTHORITY</span>
                  <span className="role-security-badge">
                    <CheckCircleIcon size={13} color="#16a34a" />
                    <span>Authorized Portal</span>
                  </span>
                </div>
                <p className="role-info-summary">
                  Access municipal directives, hyper-local ward GIS telemetry, SMS broadcast gateways, and disaster response dispatch.
                </p>
              </div>
            ) : (
              <div className="role-info-card citizen animate-role-card">
                <div className="role-header-line">
                  <span className="role-badge citizen">CITIZEN &amp; COMMUNITY ACCESS</span>
                  <span className="role-security-badge">
                    <CheckCircleIcon size={13} color="#0284c7" />
                    <span>Open Access</span>
                  </span>
                </div>
                <p className="role-info-summary">
                  Real-time thermal stress index, nearby emergency cooling centers, drinking water kiosks, and personalized heat health advisories.
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Button with Dynamic Label & Animated Accent */}
          <button
            type="button"
            className={`auth-primary-submit-btn ${role === 'citizen' ? 'citizen-accent' : 'authority-accent'} ${isLoading ? 'loading' : ''}`}
            onClick={() => handleLogin(role)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading-state">
                <span className="btn-spinner" />
                <span>Entering Portal...</span>
              </span>
            ) : (
              <span className="btn-label-state">
                <span>{role === 'authority' ? 'Enter Authority Portal' : 'Enter Citizen Portal'}</span>
                <ArrowRightIcon size={18} />
              </span>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="auth-signup-footer">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="signup-link-btn"
              onClick={() => handleLogin(role)}
            >
              Sign up
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
