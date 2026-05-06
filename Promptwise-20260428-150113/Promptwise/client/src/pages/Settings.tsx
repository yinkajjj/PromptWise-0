import { useMemo, useState } from "react";
import { Brain, Mail, Palette, Save, Shield, User } from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Theme, useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  bio: string;
};

const PROFILE_STORAGE_KEY = "promptwise:profile";
const OTP_STORAGE_KEY = "promptwise:otp-registration";

const THEME_OPTIONS: Array<{ value: Theme; label: string; subtitle: string }> = [
  { value: "white", label: "White", subtitle: "Crisp and high-contrast" },
  { value: "grey", label: "Grey", subtitle: "Soft neutral workspace" },
  { value: "dark", label: "Dark", subtitle: "Low-light focus mode" },
];

const defaultProfile: UserProfile = {
  fullName: "",
  username: "",
  email: "",
  bio: "",
};

const readProfile = (): UserProfile => {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!rawValue) {
    return defaultProfile;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return {
      fullName: parsed.fullName ?? "",
      username: parsed.username ?? "",
      email: parsed.email ?? "",
      bio: parsed.bio ?? "",
    };
  } catch {
    return defaultProfile;
  }
};

const writeProfile = (profile: UserProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile>(() => readProfile());
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [otpSentAt, setOtpSentAt] = useState<string | null>(null);

  const protocolSteps = useMemo(
    () => [
      "Collect and normalize the email address (trim, lowercase, validate format).",
      "Create a one-time 6 digit code, store only hashed value + expiry + attempt counter.",
      "Deliver OTP through transactional email provider and include anti-phishing notice.",
      "Accept OTP submission, compare hash in constant time, enforce expiry and max attempts.",
      "On success, mark email as verified, create session, and invalidate all active OTP codes.",
      "Log the event for audit, rate limit requests, and block repeated abuse patterns.",
    ],
    [],
  );

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!profile.fullName.trim()) {
      toast.error("Profile name is required");
      return;
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    writeProfile(profile);
    toast.success("Profile updated");
  };

  const handleSendOtp = () => {
    const normalizedEmail = registrationEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email to receive OTP");
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const payload = {
      email: normalizedEmail,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      sentAt: new Date().toISOString(),
      attempts: 0,
    };

    window.localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(payload));
    setOtpSentAt(payload.sentAt);
    toast.success(`OTP sent to ${normalizedEmail}. Demo code: ${otp}`);
  };

  const handleVerifyOtp = () => {
    const rawValue = window.localStorage.getItem(OTP_STORAGE_KEY);
    if (!rawValue) {
      toast.error("Request OTP first");
      return;
    }

    try {
      const payload = JSON.parse(rawValue);
      if (Date.now() > Number(payload.expiresAt)) {
        toast.error("OTP expired. Request a new code.");
        return;
      }

      if (String(payload.otp) !== registrationOtp.trim()) {
        payload.attempts = Number(payload.attempts || 0) + 1;
        window.localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(payload));
        toast.error("Invalid OTP");
        return;
      }

      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          ...profile,
          email: String(payload.email),
        }),
      );
      window.localStorage.removeItem(OTP_STORAGE_KEY);
      setProfile((current) => ({ ...current, email: String(payload.email) }));
      setRegistrationOtp("");
      toast.success("Email verified and registration completed");
    } catch {
      toast.error("Unable to verify OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container py-12">
        <section className="mb-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-primary">Settings</p>
          <h1 className="text-4xl font-bold tracking-tight">Profile, security, and appearance</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Manage account information, registration protocol settings, and preferred theme from one place.
          </p>
        </section>

        <Tabs defaultValue="profile" className="gap-5">
          <TabsList className="h-11 rounded-xl p-1">
            <TabsTrigger value="profile" className="px-4">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="px-4">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="px-4">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Profile details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(event) => handleProfileChange("fullName", event.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(event) => handleProfileChange("username", event.target.value)}
                    placeholder="promptwise-creator"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => handleProfileChange("email", event.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(event) => handleProfileChange("bio", event.target.value)}
                    placeholder="Tell people what you build with AI"
                    className="min-h-24"
                  />
                </div>
              </div>

              <Button className="mt-5" onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Save profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">OTP registration protocol</h2>
                </div>

                <ol className="space-y-2 text-sm text-muted-foreground">
                  {protocolSteps.map((step, index) => (
                    <li key={step} className="rounded-xl bg-muted/50 px-3 py-2">
                      <strong className="mr-2 text-foreground">{index + 1}.</strong>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Email + OTP registration demo</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    type="email"
                    value={registrationEmail}
                    onChange={(event) => setRegistrationEmail(event.target.value)}
                    placeholder="Enter email address"
                  />
                  <Button onClick={handleSendOtp}>Send OTP</Button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    value={registrationOtp}
                    onChange={(event) => setRegistrationOtp(event.target.value)}
                    placeholder="Enter received OTP"
                  />
                  <Button variant="outline" onClick={handleVerifyOtp}>Verify OTP</Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">OTP length: 6 digits</Badge>
                  <Badge variant="outline">Expiration: 5 minutes</Badge>
                  <Badge variant="outline">Delivery: Email</Badge>
                  {otpSentAt && <Badge variant="outline">Last sent: {new Date(otpSentAt).toLocaleTimeString()}</Badge>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">Theme options</h2>
              <p className="mb-4 text-sm text-muted-foreground">Choose White, Grey, or Dark. This setting applies across the app.</p>

              <div className="grid gap-3 md:grid-cols-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "rounded-2xl border p-4 text-left transition-colors",
                      theme === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background/70 hover:border-primary/50",
                    ].join(" ")}
                    onClick={() => setTheme?.(option.value)}
                  >
                    <div className="mb-1 font-semibold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.subtitle}</div>
                    {theme === option.value && <Badge className="mt-3">Active</Badge>}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
