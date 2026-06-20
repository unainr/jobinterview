"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#c8d92e]/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-card/60 backdrop-blur-2xl border border-[#c8d92e]/20 rounded-[2.5rem] p-10 md:p-20 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c8d92e]/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#c8d92e]/20 blur-3xl rounded-full" />

          <div className="inline-flex items-center justify-center p-4 bg-[#c8d92e]/10 border border-[#c8d92e]/20 rounded-2xl mb-8 relative z-10">
            <Sparkles className="w-8 h-8 text-[#c8d92e]" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground relative z-10">
            Ready to Ace Your <span className="text-[#c8d92e]">Next Interview?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of job seekers who have improved their interview skills and landed their dream roles using our AI platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link
              href="/signup"
              className="bg-[#c8d92e] hover:bg-[#b5c528] text-[#161510] text-lg font-bold px-10 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-[#c8d92e]/20 hover:shadow-[#c8d92e]/40 flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              Start Practicing Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link 
              href="/signin"
              className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-transparent border-2 border-border text-foreground rounded-full font-bold text-lg hover:bg-muted transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
          
          <p className="mt-8 text-sm font-medium text-muted-foreground relative z-10">
            No credit card required. Start your free trial today.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
