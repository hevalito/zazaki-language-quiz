"use client"

import { useState } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Question, Choice } from '@/types'

interface MultipleChoiceQuestionProps {
  question: Question
  choices: Choice[]
  onAnswer: (choiceId: string, isCorrect: boolean) => void
  showResult?: boolean
  selectedChoiceId?: string
}

export function MultipleChoiceQuestion({
  question,
  choices,
  onAnswer,
  showResult = false,
  selectedChoiceId
}: MultipleChoiceQuestionProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(selectedChoiceId || null)

  const handleChoiceSelect = (choiceId: string) => {
    if (showResult) return // Don't allow selection after showing result
    
    setSelectedChoice(choiceId)
    const choice = choices.find(c => c.id === choiceId)
    if (choice) {
      onAnswer(choiceId, choice.isCorrect)
    }
  }

  const getChoiceClassName = (choice: Choice) => {
    const baseClass = "quiz-option"
    
    if (!showResult) {
      return selectedChoice === choice.id 
        ? `${baseClass} quiz-option-selected`
        : baseClass
    }
    
    // Show results
    if (choice.isCorrect) {
      return `${baseClass} quiz-option-correct`
    }
    
    if (selectedChoice === choice.id && !choice.isCorrect) {
      return `${baseClass} quiz-option-incorrect`
    }
    
    return baseClass
  }

  const getChoiceIcon = (choice: Choice) => {
    if (!showResult) return null
    
    if (choice.isCorrect) {
      return <CheckIcon className="w-5 h-5 text-green-600" />
    }
    
    if (selectedChoice === choice.id && !choice.isCorrect) {
      return <XMarkIcon className="w-5 h-5 text-red-600" />
    }
    
    return null
  }

  // Get the prompt text based on script preference
  const getPromptText = () => {
    if (typeof question.prompt === 'string') return question.prompt
    if (typeof question.prompt === 'object' && question.prompt !== null) {
      const promptObj = question.prompt as Record<string, string>
      return promptObj.en || promptObj.de || Object.values(promptObj)[0] || ''
    }
    return ''
  }

  // Get choice label based on script preference
  const getChoiceLabel = (choice: Choice) => {
    if (typeof choice.label === 'string') return choice.label
    if (typeof choice.label === 'object' && choice.label !== null) {
      const labelObj = choice.label as Record<string, string>
      return labelObj.en || labelObj.de || Object.values(labelObj)[0] || ''
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {getPromptText()}
        </h2>
        
        {/* Audio/Video/Image would go here */}
        {question.audioUrl && (
          <div className="mb-4">
            <audio controls className="mx-auto">
              <source src={question.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        
        {question.videoUrl && (
          <div className="mb-4">
            <video controls className="mx-auto max-w-full h-auto rounded-lg">
              <source src={question.videoUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        )}
        
        {question.imageUrl && (
          <div className="mb-4">
            <img 
              src={question.imageUrl} 
              alt="Question image" 
              className="mx-auto max-w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        {choices
          .sort((a, b) => a.order - b.order)
          .map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoiceSelect(choice.id)}
              disabled={showResult}
              className={getChoiceClassName(choice)}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1 text-left">
                  {getChoiceLabel(choice)}
                </span>
                {getChoiceIcon(choice)}
              </div>
            </button>
          ))}
      </div>

      {/* Explanation (shown after answer) */}
      {showResult && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Explanation</h3>
          <p className="text-blue-800 text-sm">
            {typeof question.explanation === 'string' 
              ? question.explanation 
              : (question.explanation as any)?.en || (question.explanation as any)?.de || ''}
          </p>
        </div>
      )}

      {/* Hints (if available and not showing result) */}
      {!showResult && question.hints && (
        <div className="mt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              💡 Show hint
            </summary>
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                {typeof question.hints === 'string' 
                  ? question.hints 
                  : (question.hints as any)?.en || (question.hints as any)?.de || ''}
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
