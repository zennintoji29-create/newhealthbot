import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const API_URL = "https://backkkkkkk-aqkn.onrender.com";

interface Message {
  id: string;
  text: string;
  type: "user" | "bot";
}

export const HealthChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // ---------------- Send Text Message ----------------
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), text: inputMessage, type: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage, lang: selectedLanguage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: data.reply.parts[0].text, type: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), text: "Error connecting to server.", type: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ---------------- Myth Buster ----------------
  const sendMythQuestion = async (question: string) => {
    const newMsg: Message = { id: Date.now().toString(), text: question, type: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);
    try {
      const res = await fetch(`${API_URL}/mythbuster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang: selectedLanguage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: data.answer, type: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), text: "Error fetching myth-buster answer.", type: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ---------------- Image Upload ----------------
  const sendImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("lang", selectedLanguage);

    setMessages((prev) => [...prev, { id: Date.now().toString(), text: "[Image uploaded]", type: "user" }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/analyze-image`, { method: "POST", body: formData });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: data.advice, type: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), text: "Error analyzing image.", type: "bot" }]);
    } finally {
      setIsTyping(false);
      setImageFile(null);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">ISH Health Assistant</h1>

      <div className="mb-4">
        <label>Language: </label>
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
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

      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Type your question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        <Button onClick={sendImage}>Analyze Image</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => sendMythQuestion("Is COVID-19 vaccine safe?")}>Myth: COVID Vaccine</Button>
        <Button onClick={() => sendMythQuestion("Does drinking hot water kill coronavirus?")}>Myth: Hot Water</Button>
        <Button onClick={() => sendMythQuestion("Do antibiotics prevent viral infections?")}>Myth: Antibiotics</Button>
      </div>
    </div>
  );
};
