import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import './Landing.css';

const Nav = () => (
  <nav className="landing-nav">
    <div className="brand">
      <img src="/landing_img_1.png" alt="CarbonTrack logo" />
      CarbonTrack
    </div>
    <div className="nav-links">
      <a href="#matters">Why it matters</a>
      <a href="#solution">How it helps</a>
      <Link to="/register" className="nav-cta">Get Started</Link>
    </div>
  </nav>
);

const Hero = () => (
  <section className="hero" id="home">
    <video className="bg-video" autoPlay muted loop playsInline>
      <source src="/landing_vid_1.mp4" type="video/mp4" />
    </video>
    <div className="bg-overlay"></div>
    <div className="grain"></div>
    <div className="particle" style={{ top: '20%', left: '15%' }}></div>
    <div className="particle" style={{ top: '35%', left: '6%', animationDelay: '1s' }}></div>
    <div className="particle" style={{ top: '60%', left: '22%', animationDelay: '2s' }}></div>
    <div className="particle" style={{ top: '75%', left: '10%', animationDelay: '0.5s' }}></div>
    <div className="particle" style={{ top: '45%', left: '35%', animationDelay: '3s' }}></div>

    <div className="hero-inner">
      <div className="hero-copy">
        <div className="eyebrow">Know your number, then change it</div>
        <h1 className="headline">
          <span className="row"><span style={{ animationDelay: '.3s' }}>Track Your</span></span>
          <span className="row"><span className="dim" style={{ animationDelay: '.44s' }}>Carbon Footprint</span></span>
        </h1>
        <p className="sub">
          CarbonTrack helps individuals and organizations monitor, reduce, and act on emissions — turning a vague goal like "be more sustainable" into one running number you can actually watch go down.
        </p>
        <div className="cta-row">
          <Link to="/register" className="btn-primary">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/login" className="btn-outline">Login</Link>
        </div>
        <div className="hero-stats">
          <div className="item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M2 12h20" stroke="#95D5B2" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="9" stroke="#95D5B2" strokeWidth="1.6" />
            </svg>
            <span>A live footprint that updates as your habits do</span>
          </div>
          <div className="item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 17l6-6 4 4 8-8" stroke="#95D5B2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>A reduction plan built from your own data, not averages</span>
          </div>
          <div className="item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#95D5B2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Built for individual habits and organization-wide goals alike</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const WhyItMatters = () => (
  <section className="problem" id="matters">
    <video className="bg-video" autoPlay muted loop playsInline>
      <source src="/landing_vid_2.mp4" type="video/mp4" />
    </video>
    <div className="bg-overlay"></div>

    <div className="problem-head">
      <div className="eyebrow">Why this matters</div>
      <h2>Most of what warms the planet is invisible until someone adds it up.</h2>
      <p className="sub">
        Flights, tailpipes, and smokestacks write themselves into the sky quietly, one ordinary day at a time. CarbonTrack exists to make that number visible before it becomes unmanageable.
      </p>
    </div>

    <div className="stat-strip">
      <div className="stat"><b>37.4 Gt</b><span>CO₂ emitted globally, 2026</span></div>
      <div className="stat"><b>29%</b><span>from transport & aviation alone</span></div>
      <div className="stat"><b>Daily</b><span>how often your footprint updates</span></div>
    </div>
  </section>
);

const Seam = () => (
  <div className="seam">
    <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
      <path d="M0,0 C300,100 700,10 1440,90 L1440,150 L0,150 Z" fill="#0B1F15" />
      <ellipse cx="120" cy="45" rx="24" ry="16" fill="rgba(138,129,119,0.3)" />
      <path d="M950,50 q18,-26 36,0 q18,26 -18,29 q-36,-3 -18,-29 Z" fill="rgba(149,213,178,0.55)" />
      <path d="M1150,32 q14,-20 28,0 q14,20 -14,23 q-28,-3 -14,-23 Z" fill="rgba(149,213,178,0.65)" />
      <path d="M1320,55 q12,-17 24,0 q12,17 -12,19 q-24,-2 -12,-19 Z" fill="rgba(149,213,178,0.75)" />
    </svg>
  </div>
);

const Solution = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 90);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    cardsRef.current.forEach((c) => {
      if (c) io.observe(c);
    });

    return () => io.disconnect();
  }, []);

  return (
    <section className="solution" id="solution">
      <div className="mote" style={{ width: '16px', height: '16px', left: '12%', bottom: '10%', animationDelay: '0s' }}></div>
      <div className="mote" style={{ width: '10px', height: '10px', left: '30%', bottom: '5%', animationDelay: '2s' }}></div>
      <div className="mote" style={{ width: '14px', height: '14px', left: '55%', bottom: '14%', animationDelay: '4s' }}></div>
      <div className="mote" style={{ width: '12px', height: '12px', left: '75%', bottom: '8%', animationDelay: '1s' }}></div>
      <div className="mote" style={{ width: '18px', height: '18px', left: '88%', bottom: '20%', animationDelay: '5s' }}></div>

      <div className="solution-head">
        <div className="eyebrow">What actually moves the number</div>
        <h2>Fewer miles. Less waste. More that grows back.</h2>
        <p className="sub">None of this needs to be dramatic. CarbonTrack turns four ordinary choices into a running total you can watch go down.</p>
      </div>

      <div className="card-grid" id="cardGrid">
        <div className="solution-card" ref={el => { cardsRef.current[0] = el; }}>
          <div className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 17a2 2 0 104 0 2 2 0 00-4 0zM15 17a2 2 0 104 0 2 2 0 00-4 0zM7 17H4V6a1 1 0 011-1h9v6h5l-2-4h-3M9 17h6" stroke="#F5F1E6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Travel with intent</h3>
          <p>CarbonTrack flags your highest-emission trips and suggests the rail, transit, or carpool swap that cuts the most, fastest.</p>
        </div>
        <div className="solution-card" ref={el => { cardsRef.current[1] = el; }}>
          <div className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v9m0 0c-4 0-7 3-7 7 4 0 7-3 7-7zm0 0c4 0 7 3 7 7-4 0-7-3-7-7z" stroke="#F5F1E6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Consume less, waste less</h3>
          <p>Track everyday footprint — food, energy, goods — and see which habit is quietly costing you the most carbon.</p>
        </div>
        <div className="solution-card" ref={el => { cardsRef.current[2] = el; }}>
          <div className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#F5F1E6" strokeWidth="1.6" />
              <path d="M12 3v18M3 12h18" stroke="#F5F1E6" strokeWidth="1.2" opacity="0.5" />
            </svg>
          </div>
          <h3>Restore, don't just reduce</h3>
          <p>Offset what you can't cut yet through verified reforestation — and see the acres you've helped bring back.</p>
        </div>
        <div className="solution-card" ref={el => { cardsRef.current[3] = el; }}>
          <div className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" stroke="#F5F1E6" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Switch the source</h3>
          <p>See how much a solar or renewable plan would shave off your total before you ever call a provider.</p>
        </div>
      </div>

      <div className="solution-cta">
        <h3>Your baseline takes two minutes to calculate.</h3>
        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Calculate my footprint</Link>
      </div>
    </section>
  );
};

const LoginFooter = () => (
  <div className="login-wrap" id="login">
    <div style={{ width: '100%' }}>
      <div className="login-card">
        <div className="brand">
          <img src="/landing_img_2.png" alt="CarbonTrack logo" style={{ width: '26px', height: '26px' }} />
          CarbonTrack
        </div>
        <p className="hint">Sign in to see today's number.</p>
        <Link to="/login" className="login-submit" style={{ textDecoration: 'none', color: 'white' }}>Sign in</Link>
        <p className="login-foot">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="landing-footer">
    CarbonTrack — measure what matters, then change it.
  </footer>
);

export default function Landing() {
  return (
    <div className="landing-container">
      <Nav />
      <Hero />
      <WhyItMatters />
      <Seam />
      <Solution />
      <LoginFooter />
      <Footer />
    </div>
  );
}
