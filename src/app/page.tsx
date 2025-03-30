import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Header from "@/components/landing-page/header";
import HeroSection from "@/components/landing-page/hero-section";
import { FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <Header />
      <main className="flex-1">

        {/* Hero Section */}
      <HeroSection />

        {/* Feature Section */}
        <section id="features" className="bg-muted/50 px-4 py-12 md:py-24">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Everything you need to bring your voice projects to life
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-background rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icons.mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Voice Cloning</h3>
                <p className="mt-2 text-muted-foreground">
                  Train a custom AI voice model with just a few minutes of audio. Use your voice for any project.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-background rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Story Generation</h3>
                <p className="mt-2 text-muted-foreground">
                  Generate engaging stories with AI in any genre. Perfect for podcasts, audiobooks, and more.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-background rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icons.music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Audio Editing</h3>
                <p className="mt-2 text-muted-foreground">
                  Trim, split, add background music, and export your audio in a user-friendly interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-4 py-12 md:py-24">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Choose the plan that works for your needs
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-lg border bg-background p-6 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Free</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Perfect for trying out Voice Studio
                  </p>
                </div>
                <ul className="mb-6 mt-4 space-y-2.5 flex-1">
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">10 minutes of audio per month</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">1 custom voice model</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Basic audio editing</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-auto">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
              
              {/* Premium Plan */}
              <div className="rounded-lg border bg-background p-6 shadow-sm relative flex flex-col">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Premium</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For content creators and professionals
                  </p>
                </div>
                <ul className="mb-6 mt-4 space-y-2.5 flex-1">
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">120 minutes of audio per month</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">5 custom voice models</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Advanced audio editing</span>
          </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Priority rendering</span>
          </li>
                </ul>
                <Link href="/signup" className="mt-auto">
                  <Button className="w-full">Subscribe Now</Button>
                </Link>
              </div>
              
              {/* Enterprise Plan */}
              <div className="rounded-lg border bg-background p-6 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For businesses and teams
                  </p>
                </div>
                <ul className="mb-6 mt-4 space-y-2.5 flex-1">
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Unlimited audio minutes</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Unlimited voice models</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Professional audio editing</span>
                  </li>
                  <li className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Team collaboration</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-auto">
                  <Button className="w-full">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-12 md:py-24 relative overflow-hidden bg-muted/50">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Ready to transform your voice projects?
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-xl">
                Join thousands of creators using Voice Studio to bring their ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-6 md:py-10">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icons.logo className="h-6 w-6" />
                <span className="font-semibold">Voice Studio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI voice cloning and audio editing platform for creators and professionals.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Tutorials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Voice Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
