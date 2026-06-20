import Link from "next/link";
import Logo from "@/components/layouts/logo";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.603 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your personal AI interview coach. Practice, improve, and land your dream job with confidence.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#c8d92e] hover:text-[#161510] transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#c8d92e] hover:text-[#161510] transition-colors">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#c8d92e] hover:text-[#161510] transition-colors">
                <GithubIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Home</Link></li>
              <li><Link href="/interview" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Interview</Link></li>
              <li><Link href="/billing" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Billing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Account</h4>
            <ul className="space-y-4">
              <li><Link href="/signin" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-[#c8d92e] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clario AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Made with <span className="text-[#c8d92e]">♥</span> by UNAIN
          </div>
        </div>
      </div>
    </footer>
  );
}
