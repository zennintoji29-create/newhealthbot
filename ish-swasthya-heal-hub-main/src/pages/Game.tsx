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
  { question: "Best time to brush teeth?", options: ["Morning & night", "Only morning", "Only night", "After every meal"], correct: "Morning & night", points: 10 },
  { question: "Daily water intake for adults?", options: ["1 liter", "2-3 liters", "5 liters", "500ml"], correct: "2-3 liters", points: 10 },
  { question: "Common symptom of diabetes?", options: ["Frequent urination", "Hair loss", "Cough", "Blurred vision"], correct: "Frequent urination", points: 10 },
  { question: "Which vitamin comes from sunlight?", options: ["Vitamin A", "Vitamin D", "Vitamin B12", "Vitamin K"], correct: "Vitamin D", points: 10 },
  { question: "Safe way to prevent food poisoning?", options: ["Raw meat", "Boiled water", "Wash hands", "Eating fast food"], correct: "Wash hands", points: 10 },
  { question: "Best exercise for flexibility?", options: ["Running", "Yoga", "Weightlifting", "Cycling"], correct: "Yoga", points: 10 },
  { question: "What is a balanced diet?", options: ["Carbs only", "Protein only", "Variety of nutrients", "No fat"], correct: "Variety of nutrients", points: 10 },
  { question: "Which habit reduces stress?", options: ["Meditation", "Overthinking", "Skipping meals", "Watching TV"], correct: "Meditation", points: 10 },
  { question: "What prevents common cold?", options: ["Hand washing", "Cold drinks", "Skipping meals", "Vitamin C pills"], correct: "Hand washing", points: 10 },
  { question: "Which food is rich in iron?", options: ["Spinach", "Rice", "Potatoes", "Apple"], correct: "Spinach", points: 10 },
];

const Game = () => {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ai-quiz?lang=en`);
      if (data.quiz) {
        // replicate to 15+ questions if backend returns only one
        const quizzes = Array.from({ length: 15 }, () => data.quiz);
        setQuizList(quizzes);
      } else {
        setQuizList(LOCAL_QUIZZES);
      }
    } catch (err) {
      console.error(err);
      setQuizList(LOCAL_QUIZZES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleAnswer = (option: string) => {
    const currentQuiz = quizList[currentIndex];
    setSelected(option);
    if (option === currentQuiz.correct) {
      setFeedback("✅ Correct!");
      setScore((prev) => prev + currentQuiz.points);
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

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between mb-2">
        <span>Question {currentIndex + 1}/{quizList.length}</span>
        <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">{currentQuiz.question}</h2>
          <div className="grid gap-3">
            {currentQuiz.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!selected}
                className={`p-3 border rounded-lg text-left w-full hover:bg-gray-100 transition 
                  ${selected
                    ? option === currentQuiz.correct
                      ? "bg-green-200 border-green-400 animate-pulse"
                      : option === selected
                      ? "bg-red-200 border-red-400 animate-shake"
                      : ""
                    : "bg-gray-50"}`}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Game;
