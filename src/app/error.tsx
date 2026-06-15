
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center space-y-8 p-12 glass rounded-3xl border-destructive/20 shadow-2xl shadow-destructive/10">
        <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="h-12 w-12" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-bold">System Runtime Error</h2>
          <p className="text-xl text-muted-foreground">
            A critical exception occurred during the execution of your request. This has been logged for administrative review.
          </p>
          <div className="p-4 bg-muted rounded-xl text-left font-mono text-sm overflow-x-auto border">
            <code className="text-destructive font-bold">[{error.digest || "500"}]</code>: {error.message || "An unexpected system error occurred."}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" onClick={() => reset()} className="h-14 px-8 text-lg font-semibold bg-primary">
            <RefreshCw className="mr-2 h-5 w-5" />
            Retry System
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold" asChild>
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Safety
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
