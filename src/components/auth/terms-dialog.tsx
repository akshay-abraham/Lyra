'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function TermsDialog({ isOpen, onAgree, onCancel }: { isOpen: boolean, onAgree: () => void, onCancel: () => void }) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if the user has scrolled to the very bottom
    if (target.scrollHeight - Math.ceil(target.scrollTop) === target.clientHeight) {
      if (!hasScrolledToEnd) {
        setHasScrolledToEnd(true);
      }
    }
  };

  useEffect(() => {
    // Reset scroll state when the dialog opens
    if (isOpen) {
      setHasScrolledToEnd(false);
    }
  }, [isOpen]);

  const isAgreeButtonDisabled = !hasScrolledToEnd;

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">Terms and Conditions</AlertDialogTitle>
          <AlertDialogDescription>
            Please read the following terms carefully and scroll to the bottom to proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4" onScroll={handleScroll}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="font-bold">Proprietary License & Copyright Notice</h3>
              <p><strong>Copyright © 2025 Akshay K. Rooben Abraham. All rights reserved.</strong></p>
              <p>
                This software and all associated materials, including but not limited to the codebase, design, architecture, content, and branding of “Lyra”, are proprietary intellectual property owned by Akshay K. Rooben Abraham.
              </p>
              <h4 className="font-bold">Restrictions</h4>
              <p>
                Unauthorized reproduction, distribution, modification, or deployment of this system, in whole or in part, is strictly prohibited.
              </p>
              <h4 className="font-bold">Authorized Usage</h4>
              <p>
                Usage of Lyra is limited to verified and registered educational institutions with explicit written authorization.
                Any other usage — including installations, trials, demonstrations, or derivative works — must be approved in writing by the author.
              </p>
              <h4 className="font-bold">Legal Action</h4>
              <p>
                Violators will be subject to legal action under applicable intellectual property and cyber laws.
              </p>
              <h4 className="font-bold">Contact Information</h4>
              <p>
                For licensing and partnership inquiries, please contact:
                <br />
                📧 <a href="mailto:akshayroobenabraham@gmail.com">akshayroobenabraham@gmail.com</a>
              </p>
            </div>
        </ScrollArea>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onAgree} disabled={isAgreeButtonDisabled}>
            {isAgreeButtonDisabled ? `Scroll to Agree` : 'Agree & Continue'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
