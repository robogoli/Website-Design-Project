import { useState, useEffect, useRef } from 'react';
import { ResourceItem } from '../types';
import { matchDirectoryQuery } from '../utils/searchEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'guide';
  text: string;
  timestamp: string;
  matchedResources?: ResourceItem[];
  examplePrompts?: string[];
}

const CHAT_STORAGE_KEY = 'civicbridge_chat_messages';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'guide',
  text: "Hey there! Need directions or a phone number? I help folks find what they need around Cumming and Forsyth County. That covers hot meals, clinics, local mechanics, schools, or emergency housing.\n\nTo get started, tell me what you need, or try one of these examples:",
  timestamp: 'Just now',
  examplePrompts: [
    'Where can I get emergency groceries today?',
    'Free dental clinic for a toothache',
    'Emergency 24/7 plumbing repair in Cumming'
  ]
};

export function useCivicChat(userName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // sessionStorage unavailable
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Persist chat messages to sessionStorage across tabs/modal closes
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage quota or error
    }
  }, [messages]);

  // Clean up pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sendMessage = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: trimmed,
        timestamp: userTimestamp
      }
    ]);

    setIsTyping(true);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      const { responseText, matched, examplePrompts } = matchDirectoryQuery(trimmed, userName);
      const guideMsgId = `guide-${Date.now()}`;
      const guideTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        {
          id: guideMsgId,
          sender: 'guide',
          text: responseText,
          timestamp: guideTimestamp,
          matchedResources: matched?.slice(0, 3),
          examplePrompts
        }
      ]);
      setIsTyping(false);
      timerRef.current = null;
    }, 400);
  };

  const clearChat = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsTyping(false);
    const refreshedWelcome: ChatMessage = {
      ...INITIAL_WELCOME_MESSAGE,
      id: `welcome-${Date.now()}`,
      text: userName
        ? `Hey there, ${userName}! Need directions or a phone number? I help folks find what they need around Cumming and Forsyth County. That covers hot meals, clinics, local mechanics, schools, or emergency housing.\n\nTo get started, tell me what you need, or try one of these examples:`
        : INITIAL_WELCOME_MESSAGE.text
    };
    setMessages([refreshedWelcome]);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat
  };
}
