import React from "react";
import { Icons } from "../icons";
import Link from "next/link";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <section className="py-12 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Introducing Voice Studio
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Your Voice, <span className="text-primary">AI Powered</span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Create custom AI voice models, generate stories, and edit audio -
              all in one powerful studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Icons.play className="mr-2 h-4 w-4" />
                  See it in action
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              No credit card required. Start with 10 free minutes.
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] md:h-[500px] md:w-[500px] rounded-lg overflow-hidden border shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 text-center">
                  <Icons.mic className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-xl font-medium">
                    Transform your voice with AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
