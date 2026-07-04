import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, MapPin } from "lucide-react";

interface AuthScreenProps {
  isModal?: boolean;
}

export default function AuthScreen({ isModal = false }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Password visible toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        if (!email || !password) {
          throw new Error("Please fill in all fields.");
        }
        await signIn(email, password);
      } else if (mode === "signup") {
        if (!name || !email || !password || !confirmPassword || !phone || !address) {
          throw new Error("Please fill in all fields.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await signUp(name, email, password, phone, address);
      } else if (mode === "forgot") {
        if (!email) {
          throw new Error("Please enter your email.");
        }
        await resetPassword(email);
        setSuccessMessage("Password reset email sent. Please check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || "An unexpected error occurred.";
      if (friendlyMessage.includes("auth/invalid-credential")) {
        friendlyMessage = "Incorrect email or password.";
      } else if (friendlyMessage.includes("auth/email-already-in-use")) {
        friendlyMessage = "An account with this email already exists.";
      } else if (friendlyMessage.includes("auth/invalid-email")) {
        friendlyMessage = "Please enter a valid email address.";
      }
      setError(friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isModal ? "w-full" : "min-h-[85vh] bg-brand-cream flex items-center justify-center px-4 py-12"}>
      <div className={isModal ? "w-full space-y-6 bg-white p-6" : "max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-brand-taupe/40 shadow-xl"}>
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Image src="/logo.png" alt="Kamta Wise Logo" width={56} height={56} className="h-14 w-auto mx-auto object-contain" priority />
          <h2 className="text-2xl font-light tracking-[0.2em] font-serif text-brand-charcoal uppercase">
            Kamta Wise
          </h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans">
            {mode === "signin" && "Sign in to your account"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </p>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-sans rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-sans rounded-md">
            {successMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <span className="text-[10px] font-sans font-bold">+91</span>
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                  Shipping Address
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-0 pl-3 flex items-center text-neutral-400">
                    <MapPin size={14} />
                  </span>
                  <textarea
                    placeholder="Flat No, Building, Street Name, Area, City, Pincode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors h-16 resize-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                <Mail size={14} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[9px] text-neutral-400 hover:text-brand-espresso font-sans transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-brand-charcoal cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Lock size={14} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-brand-cream/40 border border-brand-taupe/40 focus:border-brand-charcoal focus:outline-none rounded-lg text-sm font-sans placeholder-neutral-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-brand-charcoal cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-widest font-sans font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-brand-cream border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Google Sign In Divider & Button */}
        {mode !== "forgot" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="w-1/5 border-b border-brand-taupe/30"></span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans">Or continue with</span>
              <span className="w-1/5 border-b border-brand-taupe/30"></span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 bg-white border border-brand-taupe/60 hover:bg-brand-cream/35 text-brand-charcoal text-xs uppercase tracking-widest font-sans font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.147 4.114-3.41 0-6.17-2.76-6.17-6.17s2.76-6.17 6.17-6.17c1.498 0 2.87.534 3.94 1.428l3.1-3.1C18.99 1.94 15.82 1 12.24 1 6.03 1 1 6.03 1 12.24s5.03 11.24 11.24 11.24c5.83 0 10.74-4.22 10.74-11.24 0-.67-.06-1.3-.18-1.95H12.24z"
                />
              </svg>
              Google Account
            </button>
          </div>
        )}

        {/* Footer Navigation Link */}
        <div className="text-center pt-1 font-sans">
          {mode === "signin" && (
            <p className="text-xs text-neutral-500">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-brand-charcoal hover:text-brand-espresso font-medium transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-xs text-neutral-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-brand-charcoal hover:text-brand-espresso font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-brand-charcoal hover:text-brand-espresso font-medium transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          )}
      </div>
      </div>
    </div>
  );
}
