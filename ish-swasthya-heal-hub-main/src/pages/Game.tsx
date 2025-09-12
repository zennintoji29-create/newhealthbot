import { useState, useEffect } from "react";
import axios from "axios";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  points: number;
}

const Game = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`${import.meta.env.NEXT_PUBLIC_API_URL}/ai-quiz?lang=en`);
      setQuiz(res.data.quiz);
      setSelectedOption(null);
      setFeedback("");
    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleOptionClick = (option: string) => {
    if (!quiz) return;

    setSelectedOption(option);
    if (option === quiz.correct) {
      setScore((prev) => prev + quiz.points);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! Correct: ${quiz.correct}`);
    }

    // Load next question after 2 seconds
    setTimeout(() => {
      fetchQuiz();
    }, 2000);
  };

  if (!quiz) return <div className="text-center mt-20">Loading quiz...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Health Quiz</h2>
      <p className="mb-4">{quiz.question}</p>
      <div className="grid grid-cols-1 gap-3">
        {quiz.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleOptionClick(opt)}
            disabled={!!selectedOption}
            className={`p-3 rounded-xl border transition ${
              selectedOption
                ? opt === quiz.correct
                  ? "bg-green-400 text-white border-green-600"
                  : opt === selectedOption
                  ? "bg-red-400 text-white border-red-600"
                  : "bg-gray-100"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && <p className="mt-4 font-semibold">{feedback}</p>}
      <p className="mt-4">Score: {score}</p>
    </div>
  );
};

export default Game;
