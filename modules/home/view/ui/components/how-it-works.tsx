"use client";

import { motion } from "framer-motion";
import { UserPlus, Target, MessageSquare, TrendingUp } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Create Your Profile",
    description: "Tell us about your target role, experience level, and the companies you are aiming for.",
    icon: <UserPlus className="w-7 h-7" />,
  },
  {
    id: "02",
    title: "Select an Interview Type",
    description: "Choose from technical, behavioral, or case study interviews tailored to your industry.",
    icon: <Target className="w-7 h-7" />,
  },
  {
    id: "03",
    title: "Practice with AI",
    description: "Engage in a realistic, voice-based or text-based interview with our intelligent AI interviewer.",
    icon: <MessageSquare className="w-7 h-7" />,
  },
  {
    id: "04",
    title: "Review & Improve",
    description: "Get detailed feedback, actionable tips, and model answers to perfect your delivery.",
    icon: <TrendingUp className="w-7 h-7" />,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-muted/20 relative border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
              How It <span className="text-[#c8d92e]">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to transform your interview skills and land your dream job.
            </p>
          </motion.div>
        </div>

        <div className="relative mt-16">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-8 group-hover:border-[#c8d92e] group-hover:text-[#c8d92e] transition-all duration-500 relative shadow-xl shadow-black/5 group-hover:shadow-[#c8d92e]/10 group-hover:-translate-y-2">
                  {step.icon}
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#c8d92e] text-[#161510] text-sm font-black flex items-center justify-center shadow-lg border-4 border-background">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
