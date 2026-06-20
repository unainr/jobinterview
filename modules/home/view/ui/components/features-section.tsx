"use client";

import { motion } from "framer-motion";
import { Bot, Mic, BrainCircuit, LineChart, CheckCircle, Clock } from "lucide-react";

const features = [
  {
    title: "AI-Powered Mock Interviews",
    description: "Experience realistic interview scenarios with our advanced AI that adapts to your responses and industry.",
    icon: <Bot className="w-6 h-6 text-[#c8d92e]" />,
  },
  {
    title: "Real-time Voice Analysis",
    description: "Get instant feedback on your tone, pacing, and clarity to improve your communication skills.",
    icon: <Mic className="w-6 h-6 text-[#c8d92e]" />,
  },
  {
    title: "Smart Question Generation",
    description: "Our AI generates company-specific and role-specific questions to give you the most relevant practice.",
    icon: <BrainCircuit className="w-6 h-6 text-[#c8d92e]" />,
  },
  {
    title: "Detailed Performance Analytics",
    description: "Track your progress over time with comprehensive dashboards highlighting your strengths and areas for improvement.",
    icon: <LineChart className="w-6 h-6 text-[#c8d92e]" />,
  },
  {
    title: "Instant Expert Feedback",
    description: "Receive actionable insights and model answers immediately after completing your mock interview.",
    icon: <CheckCircle className="w-6 h-6 text-[#c8d92e]" />,
  },
  {
    title: "24/7 Availability",
    description: "Practice whenever you want, wherever you are. Your personal interview coach is always ready.",
    icon: <Clock className="w-6 h-6 text-[#c8d92e]" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-[20%] -mt-[10%] w-[50%] h-[50%] bg-[#c8d92e]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-[20%] -mb-[10%] w-[50%] h-[50%] bg-[#c8d92e]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,217,46,0.03)_0%,transparent_100%)] pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
              Master Your Next <span className="text-[#c8d92e]">Interview</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to build confidence and ace your job interviews, powered by cutting-edge AI technology.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:shadow-[#c8d92e]/5 hover:border-[#c8d92e]/40 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#c8d92e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-[#c8d92e]/10 border border-[#c8d92e]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-[#c8d92e] transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
