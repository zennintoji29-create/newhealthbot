import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const API_URL = "https://backkkkkkk-aqkn.onrender.com"; // Your backend

interface Quiz {
  question: string;
  options: string[];
  correct: string;
}

const GameAI = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState("");
  const [points, setPoints] = useState<number>(Number(localStorage.getItem("healthPoints") || 0));
  const [loading, setLoading] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "health" })
      });
      const data = await res.json();
      setQuiz(data); // data = {question, options, correct}
    } catch (err) {
      console.error(err);
      alert("Error fetching question from AI.");
    }
    setLoading(false);
  };

  const handleAnswer = () => {
    if (!quiz) return;

    if (selected === quiz.correct) {
      alert("Correct! 🎉 +10 points");
      setPoints(prev => prev + 10);
      localStorage.setItem("healthPoints", (points + 10).toString());
    } else {
      alert(`Wrong! Correct answer: ${quiz.correct}`);
    }

    setSelected("");
    fetchQuestion(); // Ask AI for next question
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">💡 AI Health Quiz 💡</h1>
      <p className="text-center mb-4">Points: {points}</p>

      {!quiz ? (
        <Button onClick={fetchQuestion} className="w-full">Start Quiz</Button>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl shadow-lg">
          <p className="text-xl font-semibold mb-4">{quiz.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quiz.options.map(opt => (
              <Button
                key={opt}
                variant={selected === opt ? "default" : "outline"}
                onClick={() => setSelected(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={handleAnswer} disabled={!selected}>
            Submit Answer
          </Button>
        </Card>
      )}
    </div>
  );
};

export default GameAI;
