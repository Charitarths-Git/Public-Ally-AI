import React, { useRef } from 'react';
import { motion, useInView } from "motion/react";
import {
    Phone,
    Clock,
    Globe,
    ArrowUpRight,
    MessageSquare,
    Database,
    Wifi,
    BarChart3,
    Zap,
    Users,
    Building2,
    Heart,
    Home,
    Landmark,
    Headphones,
    CheckCircle2,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { UserSession } from '../../types';

interface AboutPageProps {
    userSession?: UserSession;
    accentColor: string;
}

function AnimatedSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            id={id}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

function FeatureCard({ icon: Icon, title, description, accentColor }: { icon: any; title: string; description: string; accentColor: string }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="group p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-default"
            data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{
                    backgroundColor: `${accentColor}15` // 10% opacity
                }}
            >
                <Icon className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

function StepCard({ number, title, description, accentColor }: { number: number; title: string; description: string; accentColor: string }) {
    return (
        <div className="relative" data-testid={`card-step-${number}`}>
            <div className="flex items-start gap-4">
                <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
                    }}
                >
                    {number}
                </div>
                <div className="pt-1">
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{description}</p>
                </div>
            </div>
            {number < 4 && (
                <div className="absolute left-6 top-14 w-px h-16 bg-gradient-to-b from-gray-200 to-transparent" />
            )}
        </div>
    );
}

function UserCard({ icon: Icon, title, description, accentColor }: { icon: any; title: string; description: string; accentColor: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-5 rounded-xl bg-white/50 border border-gray-200/50 backdrop-blur-sm hover:bg-white transition-all"
            data-testid={`card-user-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <Icon className="w-8 h-8 mb-3" style={{ color: accentColor }} />
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </motion.div>
    );
}

export default function AboutPage({ userSession, accentColor }: AboutPageProps) {
    const features = [
        { icon: Clock, title: "24x7 Instant Support", description: "Round-the-clock voice assistance, ensuring citizens get help whenever they need it, without waiting in queues." },
        { icon: Globe, title: "Multilingual Understanding", description: "Supports Hindi, English, and regional languages, breaking down communication barriers for all citizens." },
        { icon: ArrowUpRight, title: "Smart Escalation", description: "Intelligently identifies urgent cases and seamlessly connects them to human officers for immediate attention." },
        { icon: MessageSquare, title: "Complaint Tracking via SMS", description: "Citizens receive SMS updates on their complaint status, keeping them informed throughout the resolution process." },
        { icon: Database, title: "Real-Time Data Integration", description: "Connects with government databases to provide accurate, up-to-date information on services and schemes." },
        { icon: Wifi, title: "Works Without Internet", description: "Operates on basic 2G phone calls, ensuring accessibility for citizens in remote areas without smartphones." },
        { icon: Users, title: "Massive Call Scalability", description: "Handles thousands of simultaneous calls, ensuring no citizen is left waiting during peak demand periods." },
        { icon: BarChart3, title: "Analytics Dashboard", description: "Provides real-time insights into citizen queries, enabling data-driven improvements in service delivery." },
        { icon: Sparkles, title: "Low-Latency Experience", description: "Delivers fast, responsive conversations that feel natural and keep citizens engaged without frustrating delays." },
        // Added based on user request in previous turn
        { icon: MessageSquare, title: "Whatsapp Integration", description: "Seamless WhatsApp bot integration for automated chat support and query resolution." },
    ];

    const users = [
        { icon: Landmark, title: "Government Departments", description: "Streamline citizen services across ministries" },
        { icon: Building2, title: "Municipal Bodies", description: "Handle civic complaints and queries efficiently" },
        { icon: Heart, title: "Healthcare & NGOs", description: "Provide health information and outreach" },
        { icon: Users, title: "Political Wards", description: "Connect constituents with local representatives" },
        { icon: Home, title: "Housing Societies", description: "Manage community communications at scale" },
        { icon: Headphones, title: "Citizen-Facing Organizations", description: "Enhance public service delivery" },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <section className="relative pt-8 pb-20 overflow-hidden" id="who-we-are">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 pt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="max-w-3xl"
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                            <Phone className="w-4 h-4" />
                            Voice-First Governance
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]" style={{ color: '#1a1a1a' }}>
                            Making Public Services{" "}
                            <span style={{ color: accentColor }}>Accessible</span> Through Voice
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed mb-8 max-w-2xl">
                            Lok-Mitra AI is a unified, multilingual, AI-powered voice calling system that enables
                            every citizen to access government and public services through simple phone calls,
                            even on basic 2G phones without internet.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                                style={{ backgroundColor: accentColor }}
                                data-testid="button-learn-more"
                            >
                                Learn How It Works
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-white border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                                data-testid="button-contact-hero"
                            >
                                Contact Us <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mt-16 relative"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 rounded-3xl blur-2xl opacity-50" />

                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white h-64 md:h-80 flex items-center justify-center">
                            {/* Placeholder for Hero Image */}
                            <div className="text-center p-8">
                                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${accentColor}15` }}>
                                    <Phone className="w-10 h-10" style={{ color: accentColor }} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Voice Wave Visualization</h3>
                                <p className="text-gray-500">AI-Powered Interaction</p>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                                        <Phone className="w-6 h-6" style={{ color: accentColor }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Available 24x7 in Multiple Languages</p>
                                        <p className="text-sm text-gray-500">Hindi, English, and regional languages</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Problem Section */}
            <AnimatedSection className="py-24 bg-gray-50/50" id="problem">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>The Challenge</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-gray-900">
                            The Problem We Solve
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Millions of citizens face significant barriers when trying to access government services.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Low Digital Literacy", desc: "Many citizens lack the skills to navigate digital platforms or smartphone applications." },
                            { title: "Language Barriers", desc: "Government services often don't support regional languages, excluding millions." },
                            { title: "Overloaded Helplines", desc: "Traditional call centers can't handle the volume of citizen queries efficiently." },
                            { title: "Fragmented Systems", desc: "Citizens must navigate multiple disconnected systems to access different services." },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-2xl bg-white border border-gray-200"
                                data-testid={`card-problem-${i + 1}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                                    <span className="text-red-500 font-bold">{i + 1}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Solution Section */}
            <AnimatedSection className="py-24" id="solution">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>Our Approach</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-gray-900">
                                Our Solution: Lok-Mitra AI
                            </h2>
                            <p className="text-lg text-gray-500 leading-relaxed mb-8">
                                Lok-Mitra AI serves as a unified voice agent that handles both inbound and outbound
                                calls across multiple sectors. Whether a citizen needs information about healthcare
                                schemes, wants to file a municipal complaint, or requires assistance with welfare
                                programs, our AI-powered system provides instant, accurate support.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Unified platform for all government services",
                                    "Natural voice conversations in your language",
                                    "Instant resolution or smart human escalation",
                                    "Works on any phone, no internet required",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl blur-2xl" />
                            <div className="relative p-8 rounded-2xl bg-white border border-gray-200 shadow-lg">
                                <div className="flex items-center justify-center mb-8">
                                    <div className="relative">
                                        <div
                                            className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl text-white"
                                            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                                        >
                                            <Phone className="w-10 h-10" />
                                        </div>
                                        <div
                                            className="absolute -inset-4 border-2 border-dashed rounded-full animate-spin"
                                            style={{
                                                animationDuration: "20s",
                                                borderColor: `${accentColor}40`
                                            }}
                                        />
                                        <div
                                            className="absolute -inset-8 border border-dashed rounded-full animate-spin"
                                            style={{
                                                animationDuration: "30s",
                                                animationDirection: "reverse",
                                                borderColor: `${accentColor}20`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Health", "Municipal", "NGOs", "Governance"].map((sector, i) => (
                                        <motion.div
                                            key={sector}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            viewport={{ once: true }}
                                            className="p-4 rounded-xl bg-gray-50 text-center border border-gray-100"
                                        >
                                            <span className="font-medium text-sm text-gray-700">{sector}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Features Section */}
            <AnimatedSection className="py-24 bg-gray-50/50" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-gray-900">
                            What Makes Lok-Mitra Different
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Built specifically for government-scale citizen services, with features that ensure
                            accessibility, reliability, and impact.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} accentColor={accentColor} />
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection className="py-24" id="how-it-works">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>Process</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-gray-900">
                                How It Works
                            </h2>
                            <p className="text-lg text-gray-500 leading-relaxed mb-12">
                                A simple, four-step process that makes government services accessible to everyone.
                            </p>

                            <div className="space-y-8">
                                <StepCard
                                    number={1}
                                    title="Call Received or Placed"
                                    description="A citizen calls the Lok-Mitra helpline or the system initiates an outbound call for proactive service delivery."
                                    accentColor={accentColor}
                                />
                                <StepCard
                                    number={2}
                                    title="AI Understands Intent"
                                    description="Our multilingual AI listens and accurately understands what the citizen needs, regardless of their language or dialect."
                                    accentColor={accentColor}
                                />
                                <StepCard
                                    number={3}
                                    title="Fetches Real-Time Information"
                                    description="The system connects with relevant government databases to retrieve accurate, up-to-date information specific to the citizen's query."
                                    accentColor={accentColor}
                                />
                                <StepCard
                                    number={4}
                                    title="Takes Action or Escalates"
                                    description="The AI either resolves the query directly, logs a complaint with tracking, or seamlessly connects the citizen to a human officer if needed."
                                    accentColor={accentColor}
                                />
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="sticky top-32">
                                <div className="absolute -inset-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl" />
                                <div className="relative p-8 rounded-2xl bg-white border border-gray-200">
                                    <div className="space-y-6">
                                        {[
                                            { icon: Phone, label: "Incoming Call", color: "from-blue-500 to-blue-600" },
                                            { icon: Globe, label: "Language Detection", color: "from-green-500 to-green-600" },
                                            { icon: Database, label: "Data Retrieval", color: "from-purple-500 to-purple-600" },
                                            { icon: CheckCircle2, label: "Resolution", color: `from-[${accentColor}] to-orange-600` },
                                        ].map((step, i) => (
                                            <motion.div
                                                key={step.label}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.15 }}
                                                viewport={{ once: true }}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md`}
                                                    style={i === 3 ? { background: `linear-gradient(135deg, ${accentColor}, #ea580c)` } : { background: `var(--gradient-${i}, linear-gradient(135deg, #3b82f6, #2563eb))` }} // Fallback for dynamic classes
                                                >
                                                    {/* Note: Tailwind arbitrary values with dynamic props don't work reliably, so using inline style for custom colors is safer */}
                                                    {i === 0 && <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg -z-10" />}
                                                    {i === 1 && <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg -z-10" />}
                                                    {i === 2 && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg -z-10" />}

                                                    <step.icon className="w-5 h-5 text-white z-10" />
                                                </div>
                                                <span className="font-medium text-gray-700">{step.label}</span>
                                                {i < 3 && <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Who It's For Section */}
            <AnimatedSection className="py-24 bg-gray-50/50" id="who-its-for">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: accentColor }}>Stakeholders</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-gray-900">
                            Who It Is For
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Designed for organizations that serve the public and want to make their services
                            more accessible, efficient, and citizen-friendly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <UserCard key={user.title} {...user} accentColor={accentColor} />
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Vision Section */}
            <AnimatedSection className="py-24 relative overflow-hidden" id="vision">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
                    }}
                />
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Looking Ahead</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-8 text-white">
                            Our Vision
                        </h2>
                        <p className="text-xl text-white/90 leading-relaxed mb-12">
                            We envision a future where every citizen, regardless of their location, education,
                            or access to technology, can interact with government services as easily as making
                            a phone call. Voice-first governance that is truly inclusive, scalable, and
                            transformative for public service delivery across India.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Voice-First Governance", desc: "Making voice the primary interface for public services" },
                                { title: "Inclusive Access", desc: "Reaching every citizen, including those without smartphones" },
                                { title: "Scalable Delivery", desc: "Building infrastructure for nationwide service delivery" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-white/80">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)` }}
                            >
                                <Phone className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">Lok-Mitra AI</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Empowering citizens through voice-first governance
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
