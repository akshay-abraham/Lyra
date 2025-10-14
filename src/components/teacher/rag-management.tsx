'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Book, BrainCircuit, FileUp, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import React from 'react';

const exampleFiles = [
    { name: 'syllabus-fall-2024.pdf', type: 'Syllabus', icon: FileText, size: '2.3 MB' },
    { name: 'intro-to-algebra.pdf', type: 'Textbook', icon: Book, size: '15.8 MB' },
    { name: 'lecture-notes-week1.md', type: 'Lecture Notes', icon: FileText, size: '120 KB' },
    { name: 'homework-1.docx', type: 'Homework', icon: FileText, size: '45 KB' },
];

export function RagManagement() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <BrainCircuit className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">Customize AI Knowledge</CardTitle>
                            <CardDescription>
                                Upload your course materials to give the AI a custom brain for your class.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="bg-primary/5 border-primary/20">
                        <BrainCircuit className="h-4 w-4 !text-primary" />
                        <AlertTitle className="font-headline">The Magic Behind the Curtain</AlertTitle>
                        <AlertDescription>
                            This system uses <strong>Retrieval-Augmented Generation (RAG)</strong>, a fancy term for giving the AI a super-fast search engine for your documents. When a student asks a question, Lyra finds the most relevant snippets from your uploaded materials to provide a grounded, context-aware response. It's like giving the AI your personal textbook!
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className='flex justify-between items-center'>
                             <h3 className="font-headline text-xl">Your Course Materials</h3>
                             <Button className="group transition-all duration-300 ease-in-out hover:scale-105">
                                <FileUp className="mr-2 h-4 w-4 transition-transform group-hover:rotate-[-5deg]" />
                                Upload New File
                            </Button>
                        </div>
                       
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exampleFiles.map((file, index) => (
                                <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <file.icon className="h-8 w-8 text-primary" />
                                        <div className="flex-grow">
                                            <p className="font-medium truncate">{file.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary">{file.type}</Badge>
                                                <span>{file.size}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive group">
                                            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
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
