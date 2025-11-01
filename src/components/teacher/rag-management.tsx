// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview RAG Management Component (`rag-management.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI for the "Custom Knowledge" tab in the teacher dashboard.
 * Currently, it serves as a placeholder or a mock-up. This means it displays a
 * static UI to show what the feature *will* look like in the future, but the
 * functionality (like actual file uploads) is not yet implemented.
 *
 * Its purpose is to:
 * 1.  Explain what Retrieval-Augmented Generation (RAG) is to the teacher in simple terms.
 * 2.  Show a static, hard-coded list of example course material files.
 * 3.  Provide a (currently non-functional) button to "upload" new files.
 *
 * C-like Analogy:
 * Think of it as a C function that prints a pre-defined menu of options to the
 * console, but the functions those options would call are just empty stubs for now.
 *
 * ```c
 * void display_rag_menu_mockup() {
 *   printf("--- Custom Knowledge ---\n");
 *   printf("1. Upload File (Not Implemented Yet)\n");
 *   printf("2. View Existing Files (Showing examples):\n");
 *   printf("   - syllabus.pdf\n");
 *   printf("   - lecture-notes.md\n");
 * }
 * ```
 */
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  FileText,
  Book,
  BrainCircuit,
  FileUp,
  Trash2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import React from 'react';

// This is a static array of C-like structs, used to simulate a list of files for the mockup.
const exampleFiles = [
  {
    name: 'syllabus-fall-2024.pdf',
    type: 'Syllabus',
    icon: FileText,
    size: '2.3 MB',
  },
  {
    name: 'intro-to-algebra.pdf',
    type: 'Textbook',
    icon: Book,
    size: '15.8 MB',
  },
  {
    name: 'lecture-notes-week1.md',
    type: 'Lecture Notes',
    icon: FileText,
    size: '120 KB',
  },
  { name: 'homework-1.docx', type: 'Homework', icon: FileText, size: '45 KB' },
];

/**
 * The main component function for the RAG management UI.
 *
 * @returns {JSX.Element} The rendered mockup of the RAG management tab.
 *
 * C-like Explanation: `function RagManagement() -> returns JSX_Element`
 *
 * This is a "stateless" component because it doesn't have any internal state
 * variables that change. It simply renders a static layout based on the hard-coded
 * `exampleFiles` array.
 */
export function RagManagement() {
  // The `return` statement contains the JSX that defines the component's visual structure.
  return (
    <div className='space-y-8 animate-fade-in-up'>
      <Card className='bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-primary/10 rounded-lg'>
              <BrainCircuit className='h-8 w-8 text-primary' />
            </div>
            <div>
              <CardTitle className='font-headline text-2xl'>
                Customize AI Knowledge
              </CardTitle>
              <CardDescription>
                Upload your course materials to give the AI a custom brain for
                your class.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* An alert box explaining what RAG is to the teacher in simple terms. */}
          <Alert className='bg-primary/5 border-primary/20'>
            <BrainCircuit className='h-4 w-4 !text-primary' />
            <AlertTitle className='font-headline'>
              The Magic Behind the Curtain
            </AlertTitle>
            <AlertDescription>
              This system uses{' '}
              <strong>Retrieval-Augmented Generation (RAG)</strong>, a fancy
              term for giving the AI a super-fast search engine for your
              documents. When a student asks a question, Lyra finds the most
              relevant snippets from your uploaded materials to provide a
              grounded, context-aware response. It's like giving the AI your
              personal textbook!
            </AlertDescription>
          </Alert>

          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
              <h3 className='font-headline text-xl'>Your Course Materials</h3>
              {/* This button is for display purposes only right now; it has no `onClick` handler. */}
              <Button
                disabled
                className='group transition-all duration-300 ease-in-out hover:scale-105'
              >
                <FileUp className='mr-2 h-4 w-4 transition-transform group-hover:rotate-[-5deg]' />
                Upload New File
                <Badge variant='destructive' className='ml-2'>
                  In Development
                </Badge>
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/*
                This is a `for` loop that iterates over the `exampleFiles` array
                and renders a Card for each file to display it in the list.
                for (int i = 0; i < exampleFiles.length; i++) {
                    File file = exampleFiles[i];
                    renderFileCard(file);
                }
              */}
              {exampleFiles.map((file, index) => (
                <Card
                  key={index}
                  className='transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 animate-fade-in-up'
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className='p-4 flex items-center gap-4'>
                    <file.icon className='h-8 w-8 text-primary' />
                    <div className='flex-grow'>
                      <p className='font-medium truncate'>{file.name}</p>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Badge variant='secondary'>{file.type}</Badge>
                        <span>{file.size}</span>
                      </div>
                    </div>
                    {/* A placeholder button for deleting a file. Also non-functional. */}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive group'
                      disabled
                    >
                      <Trash2 className='h-4 w-4 transition-transform group-hover:scale-110' />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
