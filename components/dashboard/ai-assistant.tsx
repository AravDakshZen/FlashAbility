"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SUGGESTIONS = [
  "Recommend a lesson for me",
  "Explain the /r/ sound",
  "What course should I take next?",
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your learning assistant. I can recommend lessons, explain topics, and suggest next courses. What would you like help with?",
};

function cannedResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("lesson") || lower.includes("recommend")) {
    return "Based on your progress, I recommend continuing with Pronunciation Practice — the /s/ sound lesson is up next and pairs well with what you have already mastered.";
  }
  if (lower.includes("/r") || lower.includes("pronounc") || lower.includes("sound")) {
    return "The /r/ sound is produced with the tongue raised toward the roof of the mouth without touching it. Try the 'Pronunciation Practice' course — it has modeled audio and visual cues for every attempt.";
  }
  if (lower.includes("next") || lower.includes("course")) {
    return "Your next best step is 'Everyday Conversation' — it builds directly on your vocabulary and will strengthen real-world exchanges. It is Intermediate level, matching where you are now.";
  }
  return "Great question! I would suggest practicing for 15 minutes a day and revisiting the lessons you found hardest. Would you like a specific course recommendation?";
}

/** Floating AI assistant with a chat sheet. */
export function AiAssistant({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
    setInput("");
    // Simulate assistant latency.
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: cannedResponse(text) },
      ]);
    }, 500);
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed right-5 bottom-5 z-40"
      >
        <Button
          size="lg"
          className="size-13 rounded-full p-0 shadow-lg"
          onClick={() => onOpenChange(true)}
          aria-label="Open AI assistant"
        >
          <Bot className="size-5" aria-hidden="true" />
        </Button>
      </motion.div>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                <Bot className="size-4.5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-base">AI Assistant</SheetTitle>
                <SheetDescription className="text-xs">
                  Recommendations, explanations, and course advice.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            <div ref={scrollRef} className="flex flex-col gap-3 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm",
                    message.role === "user"
                      ? "self-end bg-foreground text-background"
                      : "self-start bg-muted text-foreground"
                  )}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            {messages.length <= 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Sparkles className="size-3" aria-hidden="true" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about lessons, topics, courses..."
                aria-label="Message the AI assistant"
                className="h-10"
              />
              <Button type="submit" size="icon" aria-label="Send message" disabled={!input.trim()}>
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
