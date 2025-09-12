import { useEffect, useState } from "react";
import axios from "axios";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  points: number;
}

const Game = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchQuiz = async () => {
    setLoading(true);
    setFeedback(null);
    setSelected(null);

    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ai-quiz?lang=en`);
      setQuiz(data.quiz);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setQuiz({
        question: "How often should you wash your hands?",
        options: ["Once a day", "Before meals", "Never", "After using bathroom"],
        correct: "Before meals",
        points: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    setSelected(option);
    if (option === quiz?.correct) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! Correct answer: ${quiz?.correct}`);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl">Loading Quiz...</div>;

  if (!quiz) return <div className="text-center mt-20 text-xl">No quiz available.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{quiz.question}</h2>
      <div className="grid gap-3">
        {quiz.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={!!selected}
            className={`p-3 border rounded-lg text-left w-full hover:bg-gray-100 transition ${
              selected
                ? option === quiz.correct
                  ? "bg-green-200 border-green-400"
                  : option === selected
                  ? "bg-red-200 border-red-400"
                  : ""
                : "bg-gray-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && <p className="mt-4 font-semibold text-lg">{feedback}</p>}
      {selected && (
        <button
          onClick={fetchQuiz}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Next Question
        </button>
      )}
    </div>
  );
};

export default Game;
