// TRUE CAROUSEL ROADMAP - Replace lines 746-1073 in AboutPage.tsx
// Add this state at the top of AboutPage component (after line 187):
// const [activePhase, setActivePhase] = useState(0);

{/* Roadmap - Interactive Carousel */ }
<div className="max-w-7xl mx-auto">
    <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
    >
        <h3 className="text-4xl font-bold text-white mb-4">Our Scaling Roadmap</h3>
        <p className="text-gray-400 text-lg">A strategic three-phase approach to transform governance across India</p>
    </motion.div>

    {/* Carousel Container */}
    <div className="relative px-16">
        {/* Previous Button */}
        <motion.button
            onClick={() => setActivePhase((prev) => (prev === 0 ? 2 : prev - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <ChevronRight className="w-6 h-6 text-white rotate-180 group-hover:text-blue-400 transition-colors" />
        </motion.button>

        {/* Next Button */}
        <motion.button
            onClick={() => setActivePhase((prev) => (prev === 2 ? 0 : prev + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <ChevronRight className="w-6 h-6 text-white group-hover:text-green-400 transition-colors" />
        </motion.button>

        {/* Carousel Track */}
        <div className="overflow-hidden">
            <motion.div
                className="flex"
                animate={{ x: `${-activePhase * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Phase 1: Delhi Pilot */}
                <div className="w-full flex-shrink-0 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative max-w-2xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-3xl blur-2xl" />

                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10">
                            {/* Phase Number Badge */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-blue-500 border-4 border-[#0a0a0a] flex items-center justify-center shadow-2xl">
                                <span className="text-3xl font-bold text-white">01</span>
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center mb-8 mt-8">
                                <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                                    <Landmark className="w-10 h-10 text-blue-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-3xl font-bold text-white mb-3 text-center">Delhi Government Pilot</h4>
                            <p className="text-blue-400 font-medium text-center mb-8">Q1-Q2 2026 • Foundation Phase</p>

                            {/* Content Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Key Points */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                        Key Actions
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Partner with 3-5 Delhi departments (Municipal, Health, Welfare)</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Deploy dedicated helplines for each department</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Integrate with Delhi government databases</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Train AI on Delhi-specific schemes and policies</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                        Target Metrics
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Citizen Calls</span>
                                            <span className="text-white font-bold">50,000+ / 3mo</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Auto-Resolution</span>
                                            <span className="text-white font-bold">85%+</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Satisfaction Score</span>
                                            <span className="text-white font-bold">90%+</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Time Reduction</span>
                                            <span className="text-white font-bold">60%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Strategy */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                                <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    Citizen Engagement Strategy
                                </h5>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="font-semibold text-white mb-1">Awareness</div>
                                        <p className="text-gray-300 text-xs">Radio, SMS, community outreach</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white mb-1">Feedback</div>
                                        <p className="text-gray-300 text-xs">Surveys, focus groups, sentiment analysis</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-white mb-1">Training</div>
                                        <p className="text-gray-300 text-xs">Weekly AI model updates</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Phase 2: Learning & Refinement */}
                <div className="w-full flex-shrink-0 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative max-w-2xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-3xl blur-2xl" />

                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10">
                            {/* Phase Number Badge */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-purple-500 border-4 border-[#0a0a0a] flex items-center justify-center shadow-2xl">
                                <span className="text-3xl font-bold text-white">02</span>
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center mb-8 mt-8">
                                <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                                    <Brain className="w-10 h-10 text-purple-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-3xl font-bold text-white mb-3 text-center">Learn, Fix & Expand</h4>
                            <p className="text-purple-400 font-medium text-center mb-8">Q3-Q4 2026 • Refinement Phase</p>

                            {/* Learning Focus Banner */}
                            <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-6 mb-8">
                                <h5 className="text-xl font-bold text-white mb-3 text-center">🔍 Learn From Delhi Implementation</h5>
                                <p className="text-gray-300 text-center">
                                    Analyze real-world failures, fix bugs, and optimize the system based on actual citizen feedback and operational challenges
                                </p>
                            </div>

                            {/* Content Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Fixes & Improvements */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Wand2 className="w-5 h-5 text-purple-400" />
                                        Critical Fixes
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Fix conversation quality & accuracy issues</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Improve escalation intelligence & handoffs</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Add support for regional dialects</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Optimize latency & concurrent handling</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Enhance security & fraud detection</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expansion */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-purple-400" />
                                        Geographic Expansion
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Expand to 5-7 additional states</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Support 15+ Indian languages</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Customize for state-specific schemes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Partner with rural programs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Improvements */}
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                                <h5 className="text-lg font-bold text-white mb-4 text-center">📊 Measurable Improvements</h5>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">+25%</div>
                                        <div className="text-xs text-gray-400">Response Accuracy</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">15+</div>
                                        <div className="text-xs text-gray-400">Languages</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">&lt;3ms</div>
                                        <div className="text-xs text-gray-400">Latency</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Phase 3: National Scale */}
                <div className="w-full flex-shrink-0 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative max-w-2xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-3xl blur-2xl" />

                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10">
                            {/* Phase Number Badge */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl bg-green-500 border-4 border-[#0a0a0a] flex items-center justify-center shadow-2xl">
                                <span className="text-3xl font-bold text-white">03</span>
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center mb-8 mt-8">
                                <div className="w-20 h-20 rounded-2xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                    <Globe className="w-10 h-10 text-green-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-3xl font-bold text-white mb-3 text-center">Nationwide Deployment</h4>
                            <p className="text-green-400 font-medium text-center mb-8">2027 & Beyond • National Scale</p>

                            {/* Content Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Integration */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Landmark className="w-5 h-5 text-green-400" />
                                        Central Integration
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">All 28 states + 8 union territories</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Digital India initiatives integration</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Aadhaar, UPI, DigiLocker sync</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">Official Digital Public Good status</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">MEITY & NIC partnership</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Impact */}
                                <div>
                                    <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-green-400" />
                                        National Impact
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Citizens Served</span>
                                            <span className="text-white font-bold">100M+ / year</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Departments</span>
                                            <span className="text-white font-bold">500+</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Languages</span>
                                            <span className="text-white font-bold">22+</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Cost Savings</span>
                                            <span className="text-white font-bold">₹1000+ Cr/year</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-sm">Coverage</span>
                                            <span className="text-white font-bold">650+ districts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sector Deployment */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                                <h5 className="text-lg font-bold text-white mb-4 text-center">🏛️ Sector-Wide Deployment</h5>
                                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                                    <div>
                                        <div className="font-semibold text-white mb-1">Healthcare</div>
                                        <p className="text-gray-400">Appointments, schemes, telemedicine</p>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white mb-1">Education</div>
                                        <p className="text-gray-400">Scholarships, admissions, guidance</p>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white mb-1">Agriculture</div>
                                        <p className="text-gray-400">Advisory, subsidies, prices</p>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white mb-1">Welfare</div>
                                        <p className="text-gray-400">Pensions, ration, certificates</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>

        {/* Phase Indicators */}
        <div className="flex justify-center gap-3 mt-8">
            {[0, 1, 2].map((index) => (
                <button
                    key={index}
                    onClick={() => setActivePhase(index)}
                    className={`transition-all ${activePhase === index
                            ? 'w-12 h-3 rounded-full'
                            : 'w-3 h-3 rounded-full'
                        } ${index === 0
                            ? activePhase === index ? 'bg-blue-500' : 'bg-blue-500/30'
                            : index === 1
                                ? activePhase === index ? 'bg-purple-500' : 'bg-purple-500/30'
                                : activePhase === index ? 'bg-green-500' : 'bg-green-500/30'
                        }`}
                />
            ))}
        </div>
    </div>

    {/* Ultimate Vision Banner */}
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500/30 rounded-3xl p-8 text-center relative overflow-hidden max-w-4xl mx-auto"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="relative z-10">
            <h5 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-green-400" />
                The Ultimate Vision
            </h5>
            <p className="text-gray-300 text-lg leading-relaxed">
                By <span className="text-green-400 font-bold">2028</span>, every Indian citizen—regardless of literacy, language, or location—will have
                <span className="text-white font-semibold"> instant access to government services</span> through a simple phone call.
                Lok-Mitra AI will become the <span className="text-green-400 font-semibold">primary voice interface</span> between
                <span className="text-white font-semibold"> 1.4 billion citizens</span> and the state.
            </p>
        </div>
    </motion.div>
</div>
