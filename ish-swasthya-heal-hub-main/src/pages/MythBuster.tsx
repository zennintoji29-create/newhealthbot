import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const API_URL = "https://backkkkkkk-aqkn.onrender.com";

// Frequently asked myths / sample questions
const FAQ_MYTHS = [
  "Does cold weather cause a cold?",
  "Can vaccines give you the disease?",
  "Is sugar the main cause of diabetes?",
  "Does drinking lemon water detox the body?",
  "Can you catch COVID from a mask?",
];

// Fun health tips / jokes rotating bulletin
const HEALTH_JOKES = [
  "🦠 Germs hate soap, show them who's boss!",
  "🍎 An apple a day keeps the doctor away… maybe two for safety!",
  "💤 Sleep is your brain’s charging station.",
  "🚶‍♂️ Walking is cheaper than therapy and gives you fresh air!",
  "💧 Water: your body’s favorite drink.",
];

interface Message {
  id: string;
  text: string;
  type: "user" | "bot";
}

interface Props {
  selectedLanguage: string; // Passed from parent
}

const MythBuster = ({ selectedLanguage }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [faqButtons, setFaqButtons] = useState<string[]>(() =>
    FAQ_MYTHS.sort(() => 0.5 - Math.random()).slice(0, 3)
  );
  const [bulletinIndex, setBulletinIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Rotate FAQ buttons every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setFaqButtons(FAQ_MYTHS.sort(() => 0.5 - Math.random()).slice(0, 3));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Rotate bulletin jokes every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setBulletinIndex((prev) => (prev + 1) % HEALTH_JOKES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (question?: string) => {
    const msg = question || inputMessage;
    if (!msg.trim()) return;

    const newMessage: Message = { id: Date.now().toString(), text: msg, type: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/mythbuster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: msg, lang: selectedLanguage }),
      });
      const data = await res.json();
      const botReply: Message = { id: (Date.now() + 1).toString(), text: data.answer, type: "bot" };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), text: "Sorry, could not fetch myth-buster answer.", type: "bot" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Myth Buster</h1>

      {/* Rotating bulletin / joke */}
      <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded animate-pulse shadow">
        {HEALTH_JOKES[bulletinIndex]}
      </div>

      {/* FAQ Myth buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {faqButtons.map((q, i) => (
          <Button key={i} size="sm" onClick={() => sendMessage(q)}>
            {q}
          </Button>
        ))}
      </div>

      {/* Chat card */}
      <Card className="mb-4 p-4 h-96 overflow-y-auto bg-card/80 backdrop-blur-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 transition-all duration-500 ${msg.type === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.type === "user" ? "bg-green-200 animate-pulse" : "bg-white shadow-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <p className="text-sm text-gray-500 animate-pulse">Bot is typing...</p>
        )}
        <div ref={chatEndRef} />
      </Card>
{isTyping && (
  <div className="text-gray-500 flex items-center gap-2 mb-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
    Bot is typing...
  </div>
)}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask a myth-related question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={() => sendMessage()}>Send</Button>
      </div>
    </div>
  );
};

export default MythBuster;
