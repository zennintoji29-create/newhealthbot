import { useState } from "react";

const API_URL = "https://backkkkkkk-aqkn.onrender.com";

interface Message {
  id: string;
  text: string;
  type: "user" | "bot";
}

const HealthChat = () => {
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
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: data.reply.parts[0].text, type: "bot" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), text: "Error connecting to server.", type: "bot" },
      ]);
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
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: data.answer, type: "bot" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), text: "Error fetching myth-buster answer.", type: "bot" },
      ]);
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
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: data.advice, type: "bot" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), text: "Error analyzing image.", type: "bot" },
      ]);
    } finally {
      setIsTyping(false);
      setImageFile(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>ISH Health Assistant</h1>

      <div style={{ marginBottom: 10 }}>
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

      <div style={{ border: "1px solid #ccc", padding: 10, height: 300, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ textAlign: msg.type === "user" ? "right" : "left", marginBottom: 5 }}>
            <span
              style={{
                display: "inline-block",
                padding: 5,
                borderRadius: 5,
                backgroundColor: msg.type === "user" ? "#a0f0a0" : "#f0f0f0",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {isTyping && <p style={{ fontSize: 12, color: "#666" }}>Bot is typing...</p>}
      </div>

      <div style={{ display: "flex", marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Type your question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, marginRight: 5 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div style={{ display: "flex", marginBottom: 10 }}>
        <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        <button onClick={sendImage}>Analyze Image</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        <button onClick={() => sendMythQuestion("Is COVID-19 vaccine safe?")}>Myth: COVID Vaccine</button>
        <button onClick={() => sendMythQuestion("Does drinking hot water kill coronavirus?")}>Myth: Hot Water</button>
        <button onClick={() => sendMythQuestion("Do antibiotics prevent viral infections?")}>Myth: Antibiotics</button>
      </div>
    </div>
  );
};

export default HealthChat;
