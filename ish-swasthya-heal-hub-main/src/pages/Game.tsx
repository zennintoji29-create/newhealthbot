import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const quizData = [
  {
    question: "How often should you wash your hands?",
    options: ["Once a day", "Before meals", "Never", "After using bathroom"],
    correct: "Before meals",
    points: 10,
  },
  {
    question: "Which is the safest way to prevent dengue?",
    options: ["Use mosquito nets", "Drink cold water", "Take antibiotics", "No precautions needed"],
    correct: "Use mosquito nets",
    points: 10,
  },
];
const GamePage = () => {
  const [points, setPoints] = useState<number>(Number(localStorage.getItem("healthPoints") || 0));
  const [currentQuiz, setCurrentQuiz] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("healthPoints", points.toString());
  }, [points]);

  const handleAnswer = () => {
    if (!selectedOption) return;
    if (selectedOption === quizData[currentQuiz].correct) {
      alert(`Correct! You earned ${quizData[currentQuiz].points} points`);
      setPoints(points + quizData[currentQuiz].points);
    } else {
      alert(`Wrong! Correct answer: ${quizData[currentQuiz].correct}`);
    }
    setSelectedOption("");
    setCurrentQuiz((prev) => (prev + 1) % quizData.length);
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Health Quiz</h1>
      <p className="mb-4">Your Points: {points}</p>

      <Card className="p-4 mb-4">
        <p className="font-semibold mb-2">{quizData[currentQuiz].question}</p>
        <div className="flex flex-col gap-2">
          {quizData[currentQuiz].options.map((opt) => (
            <Button
              key={opt}
              variant={selectedOption === opt ? "default" : "outline"}
              onClick={() => setSelectedOption(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
        <Button className="mt-4" onClick={handleAnswer}>
          Submit Answer
        </Button>
      </Card>
    </div>
  );
};

export default GamePage;
