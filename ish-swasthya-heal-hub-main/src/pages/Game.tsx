import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";

interface QuizData {
  question: string;
  options: string[];
  correct: string;
  points: number;
}

export const GamePage = () => {
  const [points, setPoints] = useState<number>(
    Number(localStorage.getItem("healthPoints") || 0)
  );
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("healthPoints", points.toString());
  }, [points]);

  const fetchQuiz = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-quiz?lang=en`
      );
      setQuizData(res.data.quiz);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setQuizData({
        question: "How often should you wash your hands?",
        options: ["Once a day", "Before meals", "Never", "After using bathroom"],
        correct: "Before meals",
        points: 10,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswer = () => {
    if (!selectedOption || !quizData) return;

    if (selectedOption === quizData.correct) {
      setPoints(points + quizData.points);
      setFeedback(`✅ Correct! You earned ${quizData.points} points.`);
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${quizData.correct}`);
    }

    setSelectedOption("");

    // Fetch new random quiz after 1.5s
    setTimeout(() => {
      fetchQuiz();
    }, 1500);
  };

  if (loading || !quizData)
    return <p className="text-center mt-20 text-lg">Loading quiz...</p>;

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-center animate-pulse">
        Health Quiz Challenge 🩺
      </h1>
      <p className="mb-4 text-center text-lg">
        Your Points: <span className="font-semibold">{points}</span>
      </p>

      <Card className="p-6 mb-4 shadow-lg hover:scale-105 transition-transform duration-300">
        <p className="font-semibold mb-4 text-xl">{quizData.question}</p>
        <div className="flex flex-col gap-3">
          {quizData.options.map((opt) => (
            <Button
              key={opt}
              variant={selectedOption === opt ? "default" : "outline"}
              onClick={() => setSelectedOption(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={handleAnswer}
          disabled={!selectedOption}
        >
          Submit Answer
        </Button>
      </Card>

      {feedback && (
        <p
          className={`text-center mt-4 font-semibold ${
            feedback.startsWith("✅") ? "text-green-600" : "text-red-600"
          } animate-pulse`}
        >
          {feedback}
        </p>
      )}

      <Button
        variant="secondary"
        className="mt-6 mx-auto block"
        onClick={fetchQuiz}
      >
        Skip & Next Question 🔄
      </Button>
    </div>
  );
};
