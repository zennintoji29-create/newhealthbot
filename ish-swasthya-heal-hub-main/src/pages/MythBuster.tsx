import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const API_URL = "https://backkkkkkk-aqkn.onrender.com"; // Your live backend URL

interface Message {
  id: string;
  text: string;
  type: "user" | "bot";
}

export const MythBuster = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = { id: Date.now().toString(), text: inputMessage, type: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/mythbuster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputMessage, lang: selectedLanguage }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        const botReply: Message = { id: (Date.now() + 1).toString(), text: data.answer, type: "bot" };
        setMessages((prev) => [...prev, botReply]);
      } else {
        const errorMsg = data.answer || "Server error. Please try again later.";
        setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), text: errorMsg, type: "bot" }]);
      }
    } catch (err) {
      console.error("MythBuster fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 3).toString(), text: "Could not fetch myth-buster answer. Check your connection.", type: "bot" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Myth Buster</h1>

      {/* Language Selection */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Language:</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="mr">Marathi</option>
          <option value="gu">Gujarati</option>
          <option value="kn">Kannada</option>
          <option value="or">Odia</option>
        </select>
      </div>

      {/* Chat Messages */}
      <Card className="mb-4 p-4 h-96 overflow-y-auto bg-card/80 backdrop-blur-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.type === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.type === "user" ? "bg-green-200" : "bg-white shadow"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <p className="text-sm text-gray-500">Bot is typing...</p>}
      </Card>

      {/* Input Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask a myth-related question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};
