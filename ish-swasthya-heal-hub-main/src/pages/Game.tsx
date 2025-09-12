import { useEffect, useState } from "react";
import axios from "axios";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  points: number;
}

const LOCAL_QUIZZES: Quiz[] = [
  { question: "How often should you wash your hands?", options: ["Once a day", "Before meals", "Never", "After using bathroom"], correct: "Before meals", points: 10 },
  { question: "Which vaccine prevents polio?", options: ["MMR", "Polio vaccine", "BCG", "Hepatitis B"], correct: "Polio vaccine", points: 10 },
  { question: "Which nutrient is essential for bones?", options: ["Vitamin C", "Calcium", "Iron", "Vitamin K"], correct: "Calcium", points: 10 },
  { question: "What prevents mosquito bites?", options: ["Mosquito net", "Vitamin C", "Washing hands", "Sunlight"], correct: "Mosquito net", points: 10 },
  { question: "Which habit improves heart health?", options: ["Smoking", "Regular exercise", "Overeating", "No sleep"], correct: "Regular exercise", points: 10 },
];

const Game = () => {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/ai-quiz?lang=en`);
      if (res.data.quiz) {
        setQuizList([res.data.quiz, ...LOCAL_QUIZZES]);
      } else {
        setQuizList(LOCAL_QUIZZES);
      }
    } catch (err) {
      console.error("Quiz fetch error:", err);
      setQuizList(LOCAL_QUIZZES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswer = (option: string) => {
    const currentQuiz = quizList[currentIndex];
    setSelected(option);
    if (option === currentQuiz.correct) {
      setFeedback(`✅ Correct! +${currentQuiz.points} points`);
      setScore((prev) => prev + currentQuiz.points);
      // Trigger confetti effect
      setConfetti(true);
      setTimeout(() => setConfetti(false), 800);
    } else {
      setFeedback(`❌ Wrong! Correct: ${currentQuiz.correct}`);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1 < quizList.length ? prev + 1 : 0));
  };

  if (loading) return <div className="text-center mt-20 text-xl">Loading Quiz...</div>;
  if (!quizList.length) return <div className="text-center mt-20 text-xl">No quiz available.</div>;

  const currentQuiz = quizList[currentIndex];
  const progress = ((currentIndex + 1) / quizList.length) * 100;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mb-4">
        <span>Question {currentIndex + 1} / {quizList.length}</span>
        <span className="font-bold">{score} 💎</span>
      </div>

      <h2 className="text-2xl font-bold mb-4">{currentQuiz.question}</h2>

      <div className="grid gap-3">
        {currentQuiz.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={!!selected}
            className={`p-3 border rounded-lg text-left w-full transition
              bg-gray-50 hover:bg-gradient-to-r hover:from-blue-200 hover:to-green-200
              ${selected
                ? option === currentQuiz.correct
                  ? "bg-green-200 border-green-400"
                  : option === selected
                  ? "bg-red-200 border-red-400"
                  : ""
                : ""
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && <p className="mt-4 font-semibold text-lg">{feedback}</p>}

      {selected && (
        <button
          onClick={nextQuestion}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Next Question
        </button>
      )}

      {/* Confetti dots */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400 absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `confetti-fall 0.8s linear`
              }}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Game;
