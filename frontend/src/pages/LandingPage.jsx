import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Target, BookOpen, Upload, FileCheck, BarChart3, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
};

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Floating Orbs Background */}
            <div className="hero-orbs">
                <div className="hero-orb orb-1"></div>
                <div className="hero-orb orb-2"></div>
                <div className="hero-orb orb-3"></div>
            </div>

            {/* Navbar */}
            <nav className="landing-nav">
                <div className="container landing-nav-inner">
                    <Link to="/" className="navbar-brand" style={{ WebkitTextFillColor: 'unset' }}>
                        <span className="brand-icon">⚡</span> AI Mock Interview
                    </Link>
                    <div className="flex gap-3">
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-glow">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div variants={fadeUp} className="hero-badge">
                        <Sparkles size={14} /> AI-Powered Interview Prep
                    </motion.div>

                    <motion.h1 variants={fadeUp} className="hero-title">
                        Ace Your Next<br />
                        <span className="gradient-text">Technical Interview</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="hero-subtitle">
                        Upload your resume and get a personalized mock interview powered by AI.
                        Receive instant feedback, detailed analysis, and a tailored study plan.
                    </motion.p>

                    <motion.div variants={fadeUp} className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg btn-glow">
                            Start Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            I Have an Account
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUp} className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-number">AI</span>
                            <span className="hero-stat-label">Powered</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-number">100%</span>
                            <span className="hero-stat-label">Personalized</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-number">Instant</span>
                            <span className="hero-stat-label">Results</span>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="landing-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                    >
                        <h2 className="section-title">Why Choose <span className="gradient-text">AI Mock Interview?</span></h2>
                        <p className="section-subtitle">Cutting-edge AI technology tailored to your unique profile</p>
                    </motion.div>

                    <motion.div
                        className="features-grid"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeUp} className="glass-card feature-card">
                            <div className="feature-icon icon-purple">
                                <Brain size={28} />
                            </div>
                            <h3>AI-Powered Questions</h3>
                            <p>Questions generated from your actual resume, targeting your specific skills and experience level.</p>
                        </motion.div>

                        <motion.div variants={fadeUp} className="glass-card feature-card">
                            <div className="feature-icon icon-blue">
                                <Target size={28} />
                            </div>
                            <h3>Instant Analysis</h3>
                            <p>Get detailed topic-wise breakdown of your performance with accuracy metrics and weak area identification.</p>
                        </motion.div>

                        <motion.div variants={fadeUp} className="glass-card feature-card">
                            <div className="feature-icon icon-green">
                                <BookOpen size={28} />
                            </div>
                            <h3>Personalized Study Plan</h3>
                            <p>Receive a 7-day AI-generated study plan focused on your weak areas with actionable recommendations.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="landing-section section-dark">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                    >
                        <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
                        <p className="section-subtitle">Three simple steps to interview readiness</p>
                    </motion.div>

                    <motion.div
                        className="steps-container"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeUp} className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon-wrap">
                                <Upload size={32} />
                            </div>
                            <h3>Upload Resume</h3>
                            <p>Upload your PDF resume and our AI will extract your skills, technologies, and experience.</p>
                        </motion.div>

                        <div className="step-connector">
                            <ArrowRight size={24} />
                        </div>

                        <motion.div variants={fadeUp} className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon-wrap">
                                <FileCheck size={32} />
                            </div>
                            <h3>Take the Test</h3>
                            <p>Answer AI-generated MCQs tailored to your profile with a timed interface.</p>
                        </motion.div>

                        <div className="step-connector">
                            <ArrowRight size={24} />
                        </div>

                        <motion.div variants={fadeUp} className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon-wrap">
                                <BarChart3 size={32} />
                            </div>
                            <h3>Get AI Results</h3>
                            <p>Review detailed analytics, topic-wise scores, and a personalized 7-day study plan.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Highlights */}
            <section className="landing-section">
                <div className="container">
                    <motion.div
                        className="highlights-row"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeUp} className="glass-card highlight-card">
                            <Zap size={24} className="text-warning" />
                            <div>
                                <h4>Lightning Fast</h4>
                                <p className="text-dim text-sm">Tests generated in seconds, results available instantly after submission.</p>
                            </div>
                        </motion.div>
                        <motion.div variants={fadeUp} className="glass-card highlight-card">
                            <Shield size={24} className="text-success" />
                            <div>
                                <h4>Secure & Private</h4>
                                <p className="text-dim text-sm">Your resume data is processed securely and never shared with third parties.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-cta">
                <motion.div
                    className="container"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                >
                    <motion.h2 variants={fadeUp} className="cta-title">
                        Ready to Ace Your <span className="gradient-text">Interview?</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} className="cta-subtitle">
                        Join now and start practicing with AI-powered mock interviews tailored to your resume.
                    </motion.p>
                    <motion.div variants={fadeUp}>
                        <Link to="/register" className="btn btn-primary btn-lg btn-glow">
                            Get Started — It's Free <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container text-center">
                    <p className="text-dim text-sm">© 2026 AI Mock Interview. Built with ❤️ and AI.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
