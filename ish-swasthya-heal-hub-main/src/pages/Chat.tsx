import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FloatingHealthIcons } from "@/components/FloatingHealthIcons";
import { Navigation } from "@/components/Navigation";
import { Send, UploadCloud } from "lucide-react";

const API_URL = "https://backkkkkkk-aqkn.onrender.com";

interface Message {
  id: string;
  text?: string;
  type: "user" | "bot" | "image";
  timestamp: Date;
  imageUrl?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // <-- Language state

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    // Send text message
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        type: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");

      setIsTyping(true);
      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputMessage, lang: selectedLanguage }),
        });
        const data = await res.json();
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply?.parts?.[0]?.text || "Sorry, I couldn't process your request.",
          type: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: "Error connecting to server.",
            type: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }

    // Handle image upload
    if (selectedFile) {
      const imageMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: "image",
        timestamp: new Date(),
        imageUrl: URL.createObjectURL(selectedFile),
      };
      setMessages((prev) => [...prev, imageMessage]);
      setSelectedFile(null);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("lang", selectedLanguage); // send language to backend for translation

      setIsTyping(true);
      try {
        const res = await fetch(`${API_URL}/analyze-image`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const botResponse: Message = {
          id: (Date.now() + 4).toString(),
          text: data.advice || "Image processed successfully.",
          type: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 5).toString(),
            text: "Error processing the image.",
            type: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <FloatingHealthIcons />
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">ISH Health Assistant</h1>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border rounded px-2 py-1"
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
        <Card className="mb-6 p-6 h-96 overflow-y-auto bg-card/80 backdrop-blur-sm">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "image" ? (
                  <div className="chat-bubble bot p-1">
                    <img
                      src={msg.imageUrl}
                      alt="uploaded"
                      className="max-w-xs max-h-64 rounded"
                    />
                  </div>
                ) : (
                  <div className={`chat-bubble ${msg.type}`}>
                    <p>{msg.text}</p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="chat-bubble bot">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Message Input & Image Upload */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Type your health question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
            />
            <Button size="icon">
              <UploadCloud className="h-4 w-4" />
            </Button>
          </label>
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
