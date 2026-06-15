
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[12rem] font-headline font-bold text-primary/5 select-none leading-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-32 w-32 text-primary opacity-20 animate-pulse" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-bold">Lost in the Matrix?</h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            The module you're looking for has been moved or doesn't exist in our current curriculum.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold group">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
