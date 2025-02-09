import React, { useState } from 'react';
import { Question, DeviceType, TestAnswer, TestResult } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Certificate } from './Certificate';

interface TestInterfaceProps {
  device: DeviceType;
  onComplete: () => void;
  username: string;
  userId: string;
}

export function TestInterface({ device, onComplete, username, userId }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const currentQuestion = device.questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    const existingAnswer = answers.find(a => a.questionId === questionId);
    let newAnswers: TestAnswer[];

    if (currentQuestion.type === 'single') {
      if (existingAnswer) {
        newAnswers = answers.map(a =>
          a.questionId === questionId
            ? { ...a, selectedAnswers: [answerIndex] }
            : a
        );
      } else {
        newAnswers = [...answers, { questionId, selectedAnswers: [answerIndex] }];
      }
    } else {
      if (existingAnswer) {
        const selectedAnswers = existingAnswer.selectedAnswers.includes(answerIndex)
          ? existingAnswer.selectedAnswers.filter(i => i !== answerIndex)
          : [...existingAnswer.selectedAnswers, answerIndex];
        
        newAnswers = answers.map(a =>
          a.questionId === questionId
            ? { ...a, selectedAnswers }
            : a
        );
      } else {
        newAnswers = [...answers, { questionId, selectedAnswers: [answerIndex] }];
      }
    }

    setAnswers(newAnswers);
  };

  const isAnswerSelected = (questionId: string, answerIndex: number) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.selectedAnswers.includes(answerIndex) || false;
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    device.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      if (userAnswer) {
        const isCorrect = 
          question.correctAnswers.length === userAnswer.selectedAnswers.length &&
          question.correctAnswers.every(correct => 
            userAnswer.selectedAnswers.includes(correct)
          );
        if (isCorrect) correctAnswers++;
      }
    });
    
    const percentage = (correctAnswers / device.questions.length) * 100;
    setScore(percentage);
    return percentage;
  };

  const saveTestResult = (finalScore: number, passed: boolean) => {
    const testResult: TestResult = {
      id: crypto.randomUUID(),
      userId,
      username,
      deviceId: device.id,
      deviceTitle: device.title,
      score: finalScore,
      passed,
      timestamp: new Date().toISOString(),
      isLocked: true
    };

    const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    const updatedResults = [...existingResults, testResult];
    localStorage.setItem('testResults', JSON.stringify(updatedResults));
  };

  const handleNext = () => {
    const answer = answers.find(a => a.questionId === currentQuestion.id);
    if (!answer) return;

    if (currentQuestionIndex < device.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const finalScore = calculateScore();
      const passed = finalScore >= device.passingPercentage;
      saveTestResult(finalScore, passed);
      setShowResults(true);
      
      if (passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  if (showCertificate) {
    return (
      <Certificate
        username={username}
        deviceTitle={device.title}
        trainingTitle="Medizintechnik Schulung" // Hier sollten wir den tatsächlichen Schulungstitel übergeben
        score={score}
        date={new Date().toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
        onClose={() => {
          setShowCertificate(false);
          onComplete();
        }}
      />
    );
  }

  if (showResults) {
    const passed = score >= device.passingPercentage;
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Glückwunsch!' : 'Leider nicht bestanden'}
          </h2>
          <p className="text-gray-600 text-lg">
            Sie haben {score.toFixed(1)}% der Fragen richtig beantwortet
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Erforderlich: {device.passingPercentage}%
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Der Test ist nun gesperrt. Bitte wenden Sie sich an einen Administrator für eine erneute Freischaltung.
          </p>
        </div>

        <div className="space-y-4">
          {device.questions.map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Frage {index + 1}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                answers[index] && device.questions[index].correctAnswers.every(
                  correct => answers[index].selectedAnswers.includes(correct)
                ) && device.questions[index].correctAnswers.length === answers[index].selectedAnswers.length
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {answers[index] && device.questions[index].correctAnswers.every(
                  correct => answers[index].selectedAnswers.includes(correct)
                ) && device.questions[index].correctAnswers.length === answers[index].selectedAnswers.length
                  ? 'Richtig'
                  : 'Falsch'
                }
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-x-4">
          {passed && (
            <button
              onClick={() => setShowCertificate(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Zertifikat anzeigen
            </button>
          )}
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Test beenden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Frage {currentQuestionIndex + 1} von {device.questions.length}</h2>
          <span className="text-sm text-gray-500">
            Bestehensgrenze: {device.passingPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / device.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-lg font-medium mb-6">{currentQuestion.text}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = isAnswerSelected(currentQuestion.id, index);
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full p-4 text-left rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 flex-shrink-0 border-2 ${
                    currentQuestion.type === 'single' ? 'rounded-full' : 'rounded-md'
                  } mr-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  {option}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!answers.find(a => a.questionId === currentQuestion.id)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < device.questions.length - 1 ? 'Weiter' : 'Test abschließen'}
        </button>
      </div>
    </div>
  );
}