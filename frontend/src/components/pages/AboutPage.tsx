import React, { useRef, useState } from 'react';
import { motion, useInView } from "motion/react";
import {
    Brain,
    Wand2,
    Fingerprint,
    Layers,
    Phone,
    Clock,
    Globe,
    ArrowUpRight,
    MessageSquare,
    Database,
    Wifi,
    FileText,
    ShieldCheck,
    Bot,
    List,
    ScanLine,
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
    PhoneCallIcon,
    ChevronDown,
} from "lucide-react";
import { UserSession } from '../../types';

interface AboutPageProps {
    userSession?: UserSession;
    accentColor: string;
}

function CoreInnovationCard({ title, description, icon: Icon, delay, accentColor }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="relative pl-8 pb-12 border-l-2 border-gray-200 last:pb-0 last:border-0"
        >
            <div className="absolute -left-[25px] top-0 w-12 h-12 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    )
}

function TimelineStep({ number, title, content, icon: Icon, isLast, accentColor }: any) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className={`relative flex gap-8 ${!isLast ? 'pb-24' : ''}`}>
            {!isLast && (
                <div
                    className="absolute left-[39px] top-20 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent"
                />
            )}

            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10 flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-white border border-gray-100"
            >
                <div
                    className="absolute inset-2 rounded-xl opacity-10"
                    style={{ backgroundColor: accentColor }}
                />
                <Icon className="w-8 h-8" style={{ color: accentColor }} />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold border-4 border-white">
                    {number}
                </div>
            </motion.div>

            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-1 pt-2"
            >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">{content.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {content.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300" />
                                <span className="text-gray-600 text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
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
    const [currentCheckpoint, setCurrentCheckpoint] = useState(1);

    const checkpoints = ['checkpoint-1', 'checkpoint-2', 'checkpoint-3'];

    const scrollToNextCheckpoint = () => {
        const nextCheckpoint = currentCheckpoint === 3 ? 1 : currentCheckpoint + 1;
        const element = document.getElementById(checkpoints[nextCheckpoint - 1]);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setCurrentCheckpoint(nextCheckpoint);
        }
    };

    const features = [
        { icon: Clock, title: "24x7 Instant Support", description: "Round-the-clock voice assistance, ensuring citizens get help whenever they need it, without waiting in queues." },
        { icon: Globe, title: "Multilingual Understanding", description: "Supports Hindi, English, and regional languages, breaking down communication barriers for all citizens." },
        { icon: ArrowUpRight, title: "Smart Escalation", description: "Intelligently identifies urgent cases and seamlessly connects them to human officers for immediate attention." },
        { icon: MessageSquare, title: "Complaint Tracking via SMS", description: "Citizens receive SMS updates on their complaint status, keeping them informed throughout the resolution process." },
        { icon: Database, title: "Real-Time Data Integration", description: "Connects with government databases to provide accurate, up-to-date information on services and schemes." },
        { icon: Users, title: "Massive Call Scalability", description: "Handles thousands of simultaneous calls, ensuring no citizen is left waiting during peak demand periods." },
        { icon: BarChart3, title: "Analytics Dashboard", description: "Provides real-time insights into citizen queries, enabling data-driven improvements in service delivery." },
        { icon: Sparkles, title: "Low-Latency Experience", description: "Delivers fast, responsive conversations that feel natural and keep citizens engaged without frustrating delays with 5-ms latency." },
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
            <section className="relative pt-20 pb-20 overflow-hidden" id="checkpoint-1">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-transparent" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold mb-8 border backdrop-blur-sm mx-auto"
                            style={{
                                backgroundColor: `${accentColor}08`,
                                color: accentColor,
                                borderColor: `${accentColor}20`
                            }}
                        >
                            <Sparkles className="w-4 h-4" />
                            Boosting Civic Interaction through AI
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-gray-900 leading-[1.05]">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 pb-2">
                                The Voice of
                            </span>
                            <span
                                className="block text-transparent bg-clip-text bg-gradient-to-r"
                                style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #2563eb, ${accentColor})` }}
                            >
                                Connected Governance
                            </span>
                        </h1>

                        <p className="text-2xl md:text-3xl font-medium text-gray-600 leading-relaxed mb-16 max-w-3xl mx-auto">
                            Transforming how institutions speak with citizens.
                            <span className="block mt-2 text-gray-500 font-normal text-xl">
                                From creating agents on the fly to resolving queries instantly.
                            </span>
                        </p>
                    </motion.div>

                    {/* Core Highlights Grid (Replaces Voice Wave) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto place-items-center text-center flex-auto"

                    >
                        {[
                            {
                                icon: Brain,
                                title: "Completely Customizable Agents",
                                desc: "Describe your needs, and our engine builds a custom voice agent with tools & knowledge in seconds."
                            },
                            {
                                icon: Globe,
                                title: "Max User Accessibility",
                                desc: "Multilanguage Support,Automated Applications/Complains/Ticket Registration & Emergency Expert Escalation."
                            },
                            {
                                icon: PhoneCallIcon,
                                title: "Real-time Chat/Call Updates through Whatsapp",
                                desc: "Agents interact through Whatsapp for any query and call follow-ups."
                            },
                            {
                                icon: Fingerprint,
                                title: "Native E-KYC Support via Agentic Call",
                                desc: "Secure identity verification directly via WhatsApp, linked to official portals for instant approval."
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-center group relative overflow-hidden"
                            >
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"
                                    style={{ opacity: 0.5 }}
                                />
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative z-10 mx-auto"
                                    style={{ backgroundColor: `${accentColor}10` }}
                                >
                                    <item.icon className="w-7 h-7" style={{ color: accentColor }} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed relative z-10">{item.desc}</p>
                            </div>
                        ))}
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
                            { title: "Overloaded Helplines", desc: "Traditional call centers can't handle the volume of citizen queries efficiently.Also, large amount of manpower is required to function at current levels." },
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
                                    "Works on any smartphone.",
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
                                <div className="flex items-center justify-center mb-8 h-32">
                                    <div className="flex items-center gap-1.5 h-full items-end">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-3 rounded-full"
                                                style={{ backgroundColor: accentColor }}
                                                animate={{
                                                    height: [20, Math.random() * 80 + 20, 20],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1 + Math.random(),
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: i * 0.1
                                                }}
                                            />
                                        ))}
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
            <AnimatedSection className="py-24 bg-gray-50/50" id="checkpoint-2">
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
            {/* The Magic: Core Innovation Section */}
            <AnimatedSection className="py-24 bg-gray-50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2 block">Core Innovation</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 leading-tight">
                                Agents Created <br />
                                <span className="text-blue-600">On The Fly</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                                Traditional systems require weeks of coding. LokMitra-AI builds fully functional voice agents in seconds based on your description and data.
                            </p>

                            <div className="space-y-2">
                                <CoreInnovationCard
                                    icon={Brain}
                                    title="Semantic Intent Analysis"
                                    description="Simply describe what you need: 'I want an agent to handle property tax queries'. Our engine understands the domain and intent instantly."
                                    delay={0.2}
                                    accentColor={accentColor}
                                />
                                <CoreInnovationCard
                                    icon={Wand2}
                                    title="Dynamic Tool Generation"
                                    description="The AI scans your uploaded documents and automatically creates the necessary software tools to query that data."
                                    delay={0.4}
                                    accentColor={accentColor}
                                />
                                <CoreInnovationCard
                                    icon={Fingerprint}
                                    title="Native E-KYC Integration"
                                    description="Securely authenticate users via WhatsApp. Upload identity proof, verify against databases, and redirect to our EKYC portal for instant approval."
                                    delay={0.5}
                                    accentColor={accentColor}
                                />
                                <CoreInnovationCard
                                    icon={Layers}
                                    title="Instant Knowledge Ingestion"
                                    description="Upload PDFs, Excel sheets, or connect databases. The Knowledge Base digests it all into a queryable format in moments."
                                    delay={0.6}
                                    accentColor={accentColor}
                                />
                            </div>
                        </div>

                        {/* Interactive Visual Right Side */}
                        <div className="relative">
                            <div className="relative rounded-2xl bg-gray-900 p-8 shadow-2xl border border-gray-800 h-[650px] flex flex-col">
                                {/* Header */}
                                <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="ml-4 text-xs text-gray-500 font-mono">system_core.ts — Generating Agent</span>
                                </div>

                                {/* Animated Code/Process Visual */}
                                <div className="flex-1 font-mono text-sm space-y-4 overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ staggerChildren: 0.1 }}
                                    >
                                        <div className="text-blue-400">$ initial_user_prompt = "Create agent for subsidy distribution"</div>
                                        <div className="text-gray-400 ml-4">Analyzing intent... <span className="text-green-400">Done</span></div>
                                        <div className="text-purple-400">$ scanning_knowledge_base()</div>
                                        <div className="text-yellow-400">$ generating_tools()</div>
                                        <div className="text-gray-500 ml-8">→ create_tool: check_eligibility()</div>
                                        <div className="text-gray-500 ml-8">→ create_tool: verify_aadhaar_status()</div>
                                        <div className="text-cyan-400">$ enable_module("EKYC_VERIFICATION")</div>
                                        <div className="text-gray-400 ml-8">→ Connecting to WhatsApp Upload API...</div>
                                        <div className="text-gray-400 ml-8">→ Linking Identity DB...</div>
                                        <br />
                                        <div className="text-green-400 animate-pulse"> AGENT_DEPLOYED_SUCCESSFULLY</div>
                                    </motion.div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    className="absolute -right-6 top-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <FileText className="w-8 h-8 text-red-500" />
                                    <div>
                                        <div className="text-xs text-gray-500">Ingested</div>
                                        <div className="font-bold text-gray-900">Scheme_Rules.pdf</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="absolute -left-6 bottom-32 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                >
                                    <ShieldCheck className="w-8 h-8 text-green-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Module Active</div>
                                        <div className="font-bold text-gray-900">E-KYC Portal</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* User Journey / How It Works / How To Use MERGED */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">User Journey</span>
                        <h2 className="text-4xl font-bold mt-2 mb-6 text-gray-900">From Setup to Impact</h2>
                        <p className="text-gray-600 text-lg">A seamless workflow designed for organizations of any size.</p>
                    </div>

                    <div className="relative">
                        <TimelineStep
                            number="01"
                            title="Identity & Setup"
                            icon={Building2}
                            accentColor={accentColor}
                            content={{
                                description: "Begin by defining your organization's identity. This sets the context for the AI, tailoring its persona and responses to your specific domain.",
                                features: ["Select Category: Government, NGO, Corporate", "Define Department Name", "Set Escalation Protocols"]
                            }}
                        />
                        <TimelineStep
                            number="02"
                            title="Knowledge Injection"
                            icon={Bot}
                            accentColor={accentColor}
                            content={{
                                description: "This is where the magic happens. Upload your documents or connect your databases. The AI reads everything and instantly learns how to answer complex queries.",
                                features: ["Upload PDFs/Docs", "Connect SQL/Excel", "Auto-Generate Query Tools"]
                            }}
                        />
                        <TimelineStep
                            number="03"
                            title="E-KYC Configuration"
                            icon={ScanLine}
                            accentColor={accentColor}
                            content={{
                                description: "Enable the EKYC module to allow secure identity verification. Users can send documents via WhatsApp, which are verified against your records before directing them to the EKYC portal.",
                                features: ["WhatsApp Document Upload", "Automated DB Lookup", "Secure Redirection Portal"]
                            }}
                        />
                        <TimelineStep
                            number="04"
                            title="Queue Orchestration"
                            icon={List}
                            accentColor={accentColor}
                            content={{
                                description: "Manage your outreach effectively. Build calling lists, prioritize urgent contacts, and schedule outbound campaigns.",
                                features: ["Drag-and-Drop Prioritization", "Bulk Number Import", "Real-time Queue Status"]
                            }}
                        />
                        <TimelineStep
                            number="05"
                            title="Live Operations"
                            icon={Phone}
                            accentColor={accentColor}
                            content={{
                                description: "Watch as the AI handles hundreds of concurrent calls. It speaks naturally, accesses your data in real-time to answer questions, and takes action.",
                                features: ["Multilingual Conversations", "Real-time Data Fetching", "Smart Human Handoff"]
                            }}
                        />
                        <TimelineStep
                            number="06"
                            title="Insights & Analytics"
                            icon={BarChart3}
                            accentColor={accentColor}
                            content={{
                                description: "Gain deep visibility into public sentiment and service performance. Review transcripts, summaries, and success metrics.",
                                features: ["Call Transcripts", "Outcome Analysis", "Sentiment Tracking"]
                            }}
                            isLast={true}
                        />
                    </div>
                </div>
            </section>

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

            {/* Vision & Roadmap Section */}
            <AnimatedSection className="py-32 relative overflow-hidden" id="checkpoint-3">
                {/* Futuristic Background */}
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                        }}
                    />

                    {/* Glowing Orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-30 blur-[120px]"
                        style={{ background: accentColor }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center mb-20"
                    >
                        <div className="inline-block mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="text-sm font-medium text-white tracking-[0.2em] uppercase">Our Vision & Roadmap</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight">
                            Future Scope and Planning<br />
                        </h2>
                    </motion.div>

                    {/* Roadmap Timeline */}
                    <div className="max-w-6xl mx-auto">


                        {/* Phase 1: Delhi Government Collaboration */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mb-16 relative"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent" />

                            <div className="pl-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-400">01</span>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-bold text-white">Delhi Government Collaboration</h4>
                                        <p className="text-blue-400 font-medium">Q1-Q2 2026 • Pilot Phase</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-blue-400" />
                                            Initial Deployment
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <span>Partner with 3-5 key Delhi government departments (Municipal, Health, Welfare)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <span>Deploy dedicated helpline numbers for each department</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <span>Integrate with existing Delhi government databases and portals</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <span>Train AI on Delhi-specific schemes, policies, and procedures</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-400" />
                                            Target Metrics
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">50,000+</strong> citizen calls handled in first 3 months</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">85%+</strong> query resolution rate without human intervention</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">90%+</strong> citizen satisfaction score</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">60%</strong> reduction in average call handling time</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </motion.div>

                        {/* Phase 2: Refinement & Expansion */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-16 relative"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-transparent" />

                            <div className="pl-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-purple-400">02</span>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-bold text-white">Refinement & Expansion</h4>
                                        <p className="text-purple-400 font-medium">Q3-Q4 2026 • Growth Phase</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Wand2 className="w-5 h-5 text-purple-400" />
                                            Feature Enhancement
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                <span>We fine tune existing features and add new features to respond to inputs given by growing userbase.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                <span>Add video call support for visual verification and assistance</span>
                                            </li>
                                           
                                        </ul>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-purple-400" />
                                            Geographic Expansion
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                <span>Expand to greater NCR area (Gurgaon, Ghaziabad, etc.)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                                <span>Support for 15+ Indian languages and regional variations</span>
                                            </li>

                                        </ul>
                                    </div>
                                </div>


                            </div>
                        </motion.div>

                        {/* Phase 3: Nationwide Implementation */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="relative"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-green-400 to-transparent" />

                            <div className="pl-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-green-400">03</span>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-bold text-white">Nationwide Implementation</h4>
                                        <p className="text-green-400 font-medium">2027 & Beyond • National Scale</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-green-400" />
                                            Central Government Integration
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Integrate with Digital India initiatives and national portals</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Connect with Aadhaar, DigiLocker, and UPI ecosystems</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Deploy across all 28 states and 8 union territories</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Establish as official Digital Public Good (DPG)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>Partner with MEITY and NIC for infrastructure support</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                        <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-green-400" />
                                            Impact at Scale
                                        </h5>
                                        <ul className="space-y-3 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">100 Million+</strong> citizens served annually</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">500+</strong> government departments onboarded</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">22+</strong> official languages supported</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">₹1000+ Crore</strong> saved in operational costs annually</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span><strong className="text-white">24/7</strong> availability across 650+ districts</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>


                                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500/30 rounded-3xl p-8 text-center">
                                    <h5 className="text-2xl font-bold text-white mb-3">The Ultimate Vision</h5>
                                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                                        By 2028, every Indian citizen—regardless of literacy, language, or location—will have instant access to government services through a simple phone call.
                                        Lok-Mitra AI will become the <span className="text-green-400 font-semibold">primary interface</span> between citizens and the state,
                                        democratizing access to information and services at an unprecedented scale.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 mt-12" id="footer">
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

            {/* Scroll to Next Checkpoint Button */}
            <motion.button
                onClick={scrollToNextCheckpoint}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#001f3f] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                aria-label="Scroll to next checkpoint"
            >
                <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.div>

                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
        </div>
    );
}