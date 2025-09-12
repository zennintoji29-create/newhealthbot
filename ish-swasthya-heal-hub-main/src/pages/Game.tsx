import React, { useEffect, useState } from "react";
import axios from "axios";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  points: number;
}

const Game: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ai-quiz`, {
        params: { lang: "en", session_id: sessionId || undefined },
      });

      setQuiz(response.data.quiz);
      if (!sessionId) setSessionId(response.data.session_id); // Save session_id
      setSelectedOption(null);
      setFeedback(null);
    } catch (err) {
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (!quiz) return;

    if (option === quiz.correct) {
      setFeedback(`✅ Correct! +${quiz.points} points`);
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${quiz.correct}`);
    }
  };

  const handleNextQuestion = () => {
    fetchQuiz(); // Fetch next question from backend
  };

  if (loading || !quiz) {
    return <div className="text-center mt-10 text-xl">Loading question...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">{quiz.question}</h2>
      <div className="flex flex-col gap-3">
        {quiz.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleOptionClick(opt)}
            className={`p-3 rounded border text-left ${
              selectedOption === opt
                ? opt === quiz.correct
                  ? "bg-green-200 border-green-400"
                  : "bg-red-200 border-red-400"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
            disabled={!!selectedOption}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-4 text-lg font-semibold">{feedback}</div>
      )}

      {selectedOption && (
        <button
          onClick={handleNextQuestion}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next Question
        </button>
      )}
    </div>
  );
};

export default Game;
