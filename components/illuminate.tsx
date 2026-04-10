"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, RotateCcw, Mail, Phone, Download, X, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { validateAccessCode, saveResponse } from "@/app/actions"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

// Brand icon URLs
const ICONS = {
  target: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Target%201-KBazDP3xBkNV0FAl8bI7EPK610wD9W.png",
  speechBubble: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Speech%20bubble%20left-VUl8B5IS1J2RCZoa2i3dGVlatSZhmj.png",
  speechBubbles: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Speech%20bubbles%20left-jfxbiR4VLx4kCV5UWNBLGTnpTck8hG.png",
  signpost: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Signpost%20-LpKAYceP8BbXRSrEYyVlaTVDpTN3JA.png",
  star: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Star-jQMTMO5iAt12CkVslmLEsgAXqXsWo3.png",
  rosette: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Rosette-oVJAeqGrTiqMrpnRuMOUqSYRbpbllF.png",
  speechmarkIn: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Speechmark%20in-CrxwxDLlNsDBz1YudukwBFJBxIgRuJ.png",
  speechmarkOut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Speechmark%20out-ApSnoIqDhekhKyXFF5FqIRRIbBfnBv.png",
  stars: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20-%20Gradient_Stars%201-puvQYEOyBdy5np6cDtx9n5rZuIJOaQ.png",
  elev8Logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Elev-8%20logo%20-%20white%20out%20version%20-%20high%20res%20%281%29-kIS8PyL2XRcc1d231K270P9NNzsA91.png",
  frontCover: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Front%20cover-Ta227cgMUmGBZ6byoaQgafXoGQ1hLV.jpg",
}

// Personality type hero images
const PERSONALITY_IMAGES: Record<Category, string> = {
  Generator: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Generator-vd4zvm25BDcauDplOVQlAZwODDH1Mb.jpg",
  Reflector: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Reflector-ywren7q5424vZKNozqy7NioaDwqMU5.jpg",
  Connector: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Connector-pKiYtSsx5r0sVIarD3HLP7gWXoRuj5.jpg",
  Ignitor: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ignitor-P2Wa9VDihVDdMaAySZmJgPX0xv2f1q.jpg",
}

type Category = "Generator" | "Reflector" | "Connector" | "Ignitor"

interface Question {
  id: number
  statements: {
    A: string
    B: string
    C: string
    D: string
  }
}

const questions: Question[] = [
  {
    id: 1,
    statements: {
      A: "I like to take quick action and get things done.",
      B: "I like to think things through carefully before deciding on what to do next.",
      C: "I like to collaborate and work with others when getting things done.",
      D: "I like to explore new ideas and ways of doing things.",
    },
  },
  {
    id: 2,
    statements: {
      A: "I am a confident person who is ready to take the lead in a situation.",
      B: "I am a reflective person who likes to have the facts before drawing conclusions.",
      C: "I am a kind and considerate person who is always looking to support others.",
      D: "I consider myself a sociable person who enjoys the company of others.",
    },
  },
  {
    id: 3,
    statements: {
      A: "People may perceive me as being direct and to the point.",
      B: "People may perceive me as being detail oriented.",
      C: "People may perceive me as being caring and thoughtful about others.",
      D: "People may perceive me as energetic and being easily distracted.",
    },
  },
  {
    id: 4,
    statements: {
      A: "I am direct and ask for what I want.",
      B: "I like to back up points I am making with research.",
      C: "I approach things sensitively, thinking of others needs.",
      D: "I motivate others to get what I want.",
    },
  },
  {
    id: 5,
    statements: {
      A: "Goals and hitting targets are important to me.",
      B: "Logic and process are important to me.",
      C: "Creating close relationships with others is important to me.",
      D: "Creativity and spontaneity are important to me.",
    },
  },
  {
    id: 6,
    statements: {
      A: "I am focused on the things I want to achieve.",
      B: "I work in a methodical and thought through way.",
      C: "I like to involve others in things I do.",
      D: "I like to act on impulse.",
    },
  },
  {
    id: 7,
    statements: {
      A: "If a decision needs to be made, I make it swiftly.",
      B: "I think things through and consider options before deciding what to do.",
      C: "I seek other people's views before deciding on a course of action.",
      D: "If there is an innovative and untried option, I will give it a go and see what happens.",
    },
  },
  {
    id: 8,
    statements: {
      A: "I am a daring person and not afraid to take risks.",
      B: "I am a practical and considered person.",
      C: "I am a trustworthy and loyal person.",
      D: "I am a fun loving and playful person.",
    },
  },
  {
    id: 9,
    statements: {
      A: "When people are talking, I get impatient if they do not move fast enough.",
      B: "When people are talking, I look for evidence that supports their views and thinking.",
      C: "When people are talking, I consider how they may be feeling.",
      D: "When people are talking, I want them to excite me.",
    },
  },
  {
    id: 10,
    statements: {
      A: "I am competitive and I enjoy winning.",
      B: "I take my time to get things right.",
      C: "I devote time to helping others.",
      D: "I am an optimistic and positive person who sees the bright side of life.",
    },
  },
]

const categoryMapping: Record<"A" | "B" | "C" | "D", Category> = {
  A: "Generator",
  B: "Reflector",
  C: "Connector",
  D: "Ignitor",
}

const categoryDescriptions: Record<
  Category,
  { strengths: string; underPressure: string; color: string; bgColor: string; hexColor: string }
> = {
  Generator: {
    strengths:
      "Generators are confident, outspoken and clear about what they want. Sometimes to the point of being blunt. Generators are focused on measurable outcomes and are target driven. They enjoy competition and do what it takes to achieve. Generators take responsibility, have an air of authority and are often seen in leadership roles. At times, Generators can display a lack of patience, as they quickly lose interest where there's no end goal in sight.",
    underPressure:
      "Your drive for measurable outcomes can make you appear impatient; you may become a tough negotiator who shuts down without a clear win.",
    color: "bg-[#01A0B6]",
    bgColor: "bg-[#01A0B6]/10 border-[#01A0B6]/30",
    hexColor: "#01A0B6",
  },
  Reflector: {
    strengths:
      "If you want a job done right, a Reflector is the person to ask. Methodical and rational in their approach, Reflectors seek out accuracy. They want evidence, research and proof. They are thorough, can be perfectionist and take pride in being 'correct'. This attention to detail can make them appear to over complicate or be slow to make decisions. Reflectors find it harder to be with people who are overtly emotional.",
    underPressure:
      "Your need for facts can make you appear cold; you may struggle to decide if you feel you lack complete information.",
    color: "bg-[#15CBD9]",
    bgColor: "bg-[#15CBD9]/10 border-[#15CBD9]/30",
    hexColor: "#15CBD9",
  },
  Connector: {
    strengths:
      "Connectors have a very strong empathy streak. They are loyal and seek harmony in everything they do. Connectors value close relationships and are sensitive to the needs of others. Trustworthy and caring, they make excellent team players and often put the needs of others before their own. Connectors do not respond well to people who appear to lack concern or empathy for others.",
    underPressure:
      "Your desire for harmony can lead you to avoid necessary conflict; you may become less strident about your own abilities and wait for others to lead.",
    color: "bg-[#B2BFC5]",
    bgColor: "bg-[#B2BFC5]/10 border-[#B2BFC5]/30",
    hexColor: "#B2BFC5",
  },
  Ignitor: {
    strengths:
      "Ignitors carry an overflowing cup. They are energetic, enthusiastic and are often 'big picture' thinkers. Ignitors are highly creative and bring a sense of spontaneity to everything they do. They are optimistic, like to have fun and can be inspirational to those around them. Planning and organisation are not notable Ignitor qualities.",
    underPressure:
      "Your big-picture thinking can turn into a lack of focus; you may disengage the moment a project requires detailed planning or momentum slows.",
    color: "bg-[#D10980]",
    bgColor: "bg-[#D10980]/10 border-[#D10980]/30",
    hexColor: "#D10980",
  },
}

type Answers = Record<number, Record<"A" | "B" | "C" | "D", number | null>>

export interface UserData {
  name: string
  email: string
  company: string
  accessCode: string
}

export function Illuminate() {
  const [screen, setScreen] = useState<"intro" | "quiz" | "results">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userName, setUserName] = useState("")
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    company: "",
    accessCode: ""
  })
  const [resultsSaved, setResultsSaved] = useState(false)
  const [answers, setAnswers] = useState<Answers>(() => {
    const initial: Answers = {}
    questions.forEach((q) => {
      initial[q.id] = { A: null, B: null, C: null, D: null }
    })
    return initial
  })
  // Track which specific statements have been moved: { questionId: { A: true, B: false, C: true, D: false } }
  const [placedStatements, setPlacedStatements] = useState<Record<number, Record<"A" | "B" | "C" | "D", boolean>>>({})
  const currentPlacedStatements = placedStatements[questions[currentQuestion]?.id] ?? { A: false, B: false, C: false, D: false }
  
  // Track which statement was auto-placed (for pulse animation)
  const [autoPlacedStatements, setAutoPlacedStatements] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({})
  const currentAutoPlaced = autoPlacedStatements[questions[currentQuestion]?.id] ?? null

  const currentAnswers = answers[questions[currentQuestion].id]
  const usedValues = Object.values(currentAnswers).filter(
    (v) => v !== null
  ) as number[]
  const availableValues = [4, 3, 2, 1].filter((v) => !usedValues.includes(v))
  const isQuestionComplete = usedValues.length === 4

  const scores = useMemo(() => {
    const totals: Record<Category, number> = {
      Generator: 0,
      Reflector: 0,
      Connector: 0,
      Ignitor: 0,
    }

    Object.values(answers).forEach((questionAnswers) => {
      ;(["A", "B", "C", "D"] as const).forEach((letter) => {
        const value = questionAnswers[letter]
        if (value !== null) {
          totals[categoryMapping[letter]] += value
        }
      })
    })

    return totals
  }, [answers])

  const sortedCategories = useMemo(() => {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category as Category)
  }, [scores])

  const dominantPreferences = sortedCategories.slice(0, 2)
  const leastDominant = sortedCategories.slice(2, 4)

  const handleRankSelect = (
    statement: "A" | "B" | "C" | "D",
    value: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: {
        ...prev[questions[currentQuestion].id],
        [statement]: value,
      },
    }))
  }

  const handleReorder = (orderedLetters: ("A" | "B" | "C" | "D")[], draggedLetter: "A" | "B" | "C" | "D") => {
    // Visual rank to mathematical weight mapping:
    // Position 0 (visual rank 1 = "Most like me") → mathematical weight 4
    // Position 1 (visual rank 2 = "Somewhat like me") → mathematical weight 3
    // Position 2 (visual rank 3 = "Somewhat unlike me") → mathematical weight 2
    // Position 3 (visual rank 4 = "Least like me") → mathematical weight 1
    const newAnswers: Record<"A" | "B" | "C" | "D", number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    }
    orderedLetters.forEach((letter, index) => {
      newAnswers[letter] = 4 - index
    })
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: newAnswers,
    }))
    
    // Mark the dragged statement as "placed"
    const updatedPlaced = {
      ...currentPlacedStatements,
      [draggedLetter]: true,
    }
    
    // Rule of Three: Count how many are now placed
    const placedCount = Object.values(updatedPlaced).filter(Boolean).length
    
    // If 3 are placed, auto-place the 4th
    let autoPlacedLetter: "A" | "B" | "C" | "D" | null = null
    if (placedCount === 3) {
      const unplacedLetter = (["A", "B", "C", "D"] as const).find(
        (letter) => !updatedPlaced[letter]
      )
      if (unplacedLetter) {
        updatedPlaced[unplacedLetter] = true
        autoPlacedLetter = unplacedLetter
      }
    }
    
    setPlacedStatements((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: updatedPlaced,
    }))
    
    // Track auto-placed statement for pulse animation
    setAutoPlacedStatements((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: autoPlacedLetter,
    }))
    
    // Clear auto-placed after animation (1.5s)
    if (autoPlacedLetter) {
      setTimeout(() => {
        setAutoPlacedStatements((prev) => ({
          ...prev,
          [questions[currentQuestion].id]: null,
        }))
      }, 1500)
    }
  }

  const handleReset = () => {
    // Reset current question to null values (unranked state)
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: {
        A: null,
        B: null,
        C: null,
        D: null,
      },
    }))
    
    // Clear ALL "placed" states for this question (return all to unplaced)
    setPlacedStatements((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: {
        A: false,
        B: false,
        C: false,
        D: false,
      },
    }))
    
    // Clear auto-placed state
    setAutoPlacedStatements((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: null,
    }))
  }

  const handleClearStatement = (statement: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: {
        ...prev[questions[currentQuestion].id],
        [statement]: null,
      },
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setScreen("results")
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setScreen("intro")
    setCurrentQuestion(0)
    setUserName("")
    setUserData({ name: "", email: "", company: "", accessCode: "" })
    setResultsSaved(false)
    const initial: Answers = {}
    questions.forEach((q) => {
      initial[q.id] = { A: null, B: null, C: null, D: null }
    })
    setAnswers(initial)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <IntroScreen 
            key="intro" 
            onStart={() => setScreen("quiz")} 
            userData={userData}
            setUserData={setUserData}
          />
        )}
        {screen === "quiz" && (
          <QuizScreen
            key="quiz"
            question={questions[currentQuestion]}
            currentAnswers={currentAnswers}
            isQuestionComplete={isQuestionComplete}
            placedStatements={currentPlacedStatements}
            autoPlacedLetter={currentAutoPlaced}
            progress={progress}
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            onReorder={handleReorder}
            onReset={handleReset}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {screen === "results" && (
          <ResultsScreen
            key="results"
            scores={scores}
            dominantPreferences={dominantPreferences}
            leastDominant={leastDominant}
            onRestart={handleRestart}
            userData={userData}
            resultsSaved={resultsSaved}
            setResultsSaved={setResultsSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function IntroScreen({ 
  onStart, 
  userData, 
  setUserData 
}: { 
  onStart: () => void
  userData: UserData
  setUserData: (data: UserData) => void 
}) {
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validate all fields
    if (!userData.name.trim()) {
      setError("Please enter your full name")
      return
    }
    if (!userData.email.trim()) {
      setError("Please enter your work email")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Please enter a valid email address")
      return
    }
    if (!userData.company.trim()) {
      setError("Please enter your company name")
      return
    }
    if (!userData.accessCode.trim()) {
      setError("Please enter your access code")
      return
    }

    setIsValidating(true)
    setError(null)

    const result = await validateAccessCode(userData.accessCode)
    
    setIsValidating(false)

    if (!result.valid) {
      setError(result.error || "Invalid access code")
      return
    }

    onStart()
  }

  const inputClasses = "w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#01A0B6] focus:border-transparent text-sm shadow-[0_0_15px_rgba(0,206,209,0.2)]"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[100dvh] overflow-hidden relative"
    >
      {/* Fixed background image with object-fit: cover */}
      <div className="fixed inset-0 z-0">
        <Image
          src={ICONS.frontCover}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Logo - absolute top-left, strict max-height h-10 mobile / h-12 desktop */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-8 z-20"
        style={{ position: 'absolute', top: '2rem', left: '2rem' }}
      >
        <Image
          src={ICONS.elev8Logo}
          alt="Elev-8"
          width={120}
          height={40}
          priority
          className="object-contain max-h-12"
          style={{ width: 'auto', height: 'auto' }}
        />
      </motion.div>

      {/* Centered glassmorphism card - flex centered within viewport */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg bg-black/70 backdrop-blur-lg border border-[#00ced1] rounded-2xl p-6 md:p-8"
        >
          <div className="text-center space-y-4">
            {/* Title with gradient */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#D10980] to-[#01A0B6] bg-clip-text text-transparent">
              Illuminate
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-white/80 font-light">
              The behavioural preference tool
            </p>

            {/* Intro copy */}
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              As individual human beings, we all have a preferred way of communicating and interacting with others.{" "}
              <span className="text-[#01A0B6] font-medium">
                None of us are right or wrong
              </span>
              —we simply have different behavioural preferences.
            </p>

            {/* Form fields */}
            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Full Name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className={inputClasses}
              />
              <input
                type="email"
                placeholder="Work Email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className={inputClasses}
              />
              <input
                type="text"
                placeholder="Company"
                value={userData.company}
                onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                className={inputClasses}
              />
              <input
                type="text"
                placeholder="Access Code"
                value={userData.accessCode}
                onChange={(e) => setUserData({ ...userData, accessCode: e.target.value.toUpperCase() })}
                className={inputClasses}
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}

            {/* CTA Button with neon glow */}
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isValidating}
                size="lg"
                className="bg-[#01A0B6] hover:bg-[#01A0B6] text-black font-semibold px-8 py-6 text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,206,209,0.5)] hover:shadow-[0_0_25px_rgba(0,206,209,0.7)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Begin Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Footer text inside card */}
            <p className="text-xs text-white/30 pt-2">
              Powered by the Elev-8 behavioural preference model
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function QuizScreen({
  question,
  currentAnswers,
  isQuestionComplete,
  placedStatements,
  autoPlacedLetter,
  progress,
  currentQuestion,
  totalQuestions,
  onReorder,
  onReset,
  onNext,
  onPrevious,
}: {
  question: Question
  currentAnswers: Record<"A" | "B" | "C" | "D", number | null>
  isQuestionComplete: boolean
  placedStatements: Record<"A" | "B" | "C" | "D", boolean>
  autoPlacedLetter: "A" | "B" | "C" | "D" | null
  progress: number
  currentQuestion: number
  totalQuestions: number
  onReorder: (orderedLetters: ("A" | "B" | "C" | "D")[], draggedLetter: "A" | "B" | "C" | "D") => void
  onReset: () => void
  onNext: () => void
  onPrevious: () => void
}) {
  // Convert current answers to ordered array (highest value = top of list)
  const orderedLetters = (["A", "B", "C", "D"] as const).sort((a, b) => {
    const valA = currentAnswers[a] ?? 0
    const valB = currentAnswers[b] ?? 0
    return valB - valA // Descending order (4, 3, 2, 1)
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen flex flex-col px-4 py-8"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-[#01A0B6] font-medium">
            Drag to rank (4 = most like you)
          </span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-2" />
          <div 
            className="absolute top-0 left-0 h-2 rounded-full bg-[#01A0B6] shadow-[0_0_15px_rgba(0,206,209,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-2 text-balance">
              Rank these statements
            </h2>
            <p className="text-center text-muted-foreground">
              Drag to order from most like you (top) to least like you (bottom)
            </p>
          </motion.div>

          <DragDropQuestion
            question={question}
            orderedLetters={orderedLetters}
            placedStatements={placedStatements}
            autoPlacedLetter={autoPlacedLetter}
            onReorder={onReorder}
            onReset={onReset}
            index={currentQuestion}
          />

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentQuestion === 0}
              className="border-border hover:bg-muted"
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {isQuestionComplete ? "✓ Complete" : "Rank all statements"}
            </div>

            <Button
              onClick={onNext}
              disabled={!isQuestionComplete}
              className="bg-[#01A0B6] hover:bg-[#01A0B6]/90 text-black font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,206,209,0.5)] hover:shadow-[0_0_20px_rgba(0,206,209,0.7)] disabled:shadow-none disabled:hover:scale-100"
            >
              {currentQuestion === totalQuestions - 1 ? "See Results" : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DraggableStatementCard({
  letter,
  statement,
  currentRank,
  isDragging,
  isPlaced,
  isAutoPlaced,
  onDragStart,
  onDragEnd,
  index,
}: {
  letter: "A" | "B" | "C" | "D"
  statement: string
  currentRank: number | null
  isDragging: boolean
  isPlaced: boolean
  isAutoPlaced: boolean
  onDragStart: (e: React.DragEvent, letter: "A" | "B" | "C" | "D") => void
  onDragEnd: (e: React.DragEvent) => void
  index: number
}) {
  const rankLabels: Record<number | null, string> = {
    1: "Most like me",
    2: "Somewhat like me",
    3: "Somewhat unlike me",
    4: "Least like me",
    null: "Rank this",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isAutoPlaced ? [1, 1.05, 1] : 1,
      }}
      transition={{ 
        delay: index * 0.1,
        scale: { duration: 0.5, repeat: isAutoPlaced ? 2 : 0 }
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`min-h-[60px] transition-all duration-300 cursor-grab active:cursor-grabbing ${
        isDragging
          ? "scale-105 shadow-[0_0_30px_rgba(0,206,209,0.9)] bg-[#01A0B6]/30 border-2 border-[#00ced1] animate-pulse"
          : isPlaced
            ? "bg-teal-500/20 border-2 border-[#00ced1] shadow-[0_0_20px_rgba(0,206,209,0.5)]"
            : "bg-black border border-border hover:border-[#01A0B6]/30"
      } rounded-lg p-4 flex items-center gap-3`}
    >
      {/* Rank Number - Far Left (dim gray when unplaced, bright teal when placed) */}
      <div className="flex-shrink-0 w-8 text-center">
        <div
          className={`text-2xl font-bold transition-all duration-300 ${
            isPlaced
              ? "text-[#00ced1] drop-shadow-[0_0_8px_rgba(0,206,209,0.8)]"
              : "text-muted-foreground/40"
          }`}
        >
          {currentRank ?? "—"}
        </div>
      </div>

      {/* Drag Handle */}
      <div className="flex-shrink-0 flex flex-col gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full ${
              isDragging ? "bg-[#00ced1]" : "bg-muted-foreground/40"
            } transition-colors`}
          />
        ))}
      </div>

      {/* Letter Badge */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
          isPlaced
            ? "bg-[#01A0B6] text-black"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {letter}
      </div>

      {/* Statement Text */}
      <div className="flex-1">
        <p className="text-foreground leading-relaxed text-sm">{statement}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {rankLabels[currentRank]}
        </p>
      </div>
    </motion.div>
  )
}

function DragDropQuestion({
  question,
  orderedLetters,
  placedStatements,
  autoPlacedLetter,
  onReorder,
  onReset,
  index: qIndex,
}: {
  question: Question
  orderedLetters: ("A" | "B" | "C" | "D")[]
  placedStatements: Record<"A" | "B" | "C" | "D", boolean>
  autoPlacedLetter: "A" | "B" | "C" | "D" | null
  onReorder: (newOrder: ("A" | "B" | "C" | "D")[], draggedLetter: "A" | "B" | "C" | "D") => void
  onReset: () => void
  index: qIndex
}) {
  const [draggedLetter, setDraggedLetter] = useState<"A" | "B" | "C" | "D" | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, letter: "A" | "B" | "C" | "D") => {
    setDraggedLetter(letter)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggedLetter(null)
    setDragOverIndex(null)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (!draggedLetter) return

    const currentIndex = orderedLetters.indexOf(draggedLetter)
    if (currentIndex === targetIndex) return

    const newOrder = [...orderedLetters]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, draggedLetter)
    onReorder(newOrder, draggedLetter)
  }

  return (
    <div>
      <div className="space-y-3">
        {orderedLetters.map((letter, index) => (
          <div
            key={letter}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all duration-200 ${
              dragOverIndex === index ? "border-2 border-dashed border-[#D10980]/50 rounded-lg py-2 bg-[#D10980]/5" : ""
            }`}
          >
            <DraggableStatementCard
              letter={letter}
              statement={question.statements[letter]}
              currentRank={index + 1}
              isDragging={draggedLetter === letter}
              isPlaced={placedStatements[letter] ?? false}
              isAutoPlaced={autoPlacedLetter === letter}
              onDragStart={(e) => handleDragStart(e, letter)}
              onDragEnd={handleDragEnd}
              index={index}
            />
          </div>
        ))}
      </div>
      
      {/* Reset Order Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-[#D10980] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset Order
        </button>
      </div>
    </div>
  )
}

function ResultsScreen({
  scores,
  dominantPreferences,
  leastDominant,
  onRestart,
  userData,
  resultsSaved,
  setResultsSaved,
}: {
  scores: Record<Category, number>
  dominantPreferences: Category[]
  leastDominant: Category[]
  onRestart: () => void
  userData: UserData
  resultsSaved: boolean
  setResultsSaved: (saved: boolean) => void
}) {
  const resultsRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Save results to database on mount (only once)
  useEffect(() => {
    const saveResults = async () => {
      if (resultsSaved) return // Already saved
      
      const result = await saveResponse({
        name: userData.name,
        email: userData.email,
        company: userData.company,
        accessCode: userData.accessCode,
        generatorScore: scores.Generator,
        reflectorScore: scores.Reflector,
        connectorScore: scores.Connector,
        ignitorScore: scores.Ignitor,
      })

      if (result.success) {
        setResultsSaved(true)
      } else {
        setSaveError(result.error || "Failed to save results")
      }
    }

    saveResults()
  }, [userData, scores, resultsSaved, setResultsSaved])

  const radarData = [
    { subject: "Generator", value: scores.Generator, fullMark: 40 },
    { subject: "Reflector", value: scores.Reflector, fullMark: 40 },
    { subject: "Connector", value: scores.Connector, fullMark: 40 },
    { subject: "Ignitor", value: scores.Ignitor, fullMark: 40 },
  ]

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // Scroll to top to prevent cutoff
      window.scrollTo(0, 0)
      
      const { default: jsPDF } = await import("jspdf")

      // Use pt units for pixel-perfect A4 layout
      const pdf = new jsPDF("p", "pt", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth() // 595.28pt
      const pageHeight = pdf.internal.pageSize.getHeight() // 841.89pt
      const margin = 28
      const contentWidth = pageWidth - 2 * margin
      let y = margin

      // Helper to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      // Helper to draw image with opacity - using JPEG compression
      const drawImageWithOpacity = async (
        imgSrc: string,
        x: number,
        y: number,
        w: number,
        h: number,
        opacity: number
      ) => {
        try {
          const img = await loadImage(imgSrc)
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.globalAlpha = opacity
            ctx.drawImage(img, 0, 0)
            const data = canvas.toDataURL("image/jpeg", 0.8)
            pdf.addImage(data, "JPEG", x, y, w, h)
          }
        } catch {
          // Silent fail
        }
      }

      // Black background
      pdf.setFillColor(0, 0, 0)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Load and add logo image (top-left, fixed height 45pt - professional size)
      try {
        const logoImg = await loadImage(ICONS.elev8Logo)
        const logoHeight = 45
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight
        const logoCanvas = document.createElement("canvas")
        logoCanvas.width = logoImg.width
        logoCanvas.height = logoImg.height
        const ctx = logoCanvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0)
          const logoData = logoCanvas.toDataURL("image/jpeg", 0.8)
          pdf.addImage(logoData, "JPEG", margin, y, logoWidth, logoHeight)
        }
      } catch {
        pdf.setTextColor(1, 160, 182)
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.text("elev8", margin, y + 20)
      }

      // Illuminate title (centered)
      pdf.setTextColor(1, 160, 182)
      pdf.setFontSize(26)
      pdf.setFont("helvetica", "bold")
      pdf.text("Illuminate", pageWidth / 2, y + 26, { align: "center" })
      y += 50

      // Session message - prominent teal highlight box
const welcomeText = userData.name
      ? `Well done ${userData.name} on completing the assessment! Please bring this with you to your session later.`
        : "Well done on completing the assessment! Please bring this with you to your session later."
      
      pdf.setFillColor(1, 160, 182)
      pdf.roundedRect(margin, y, contentWidth, 34, 4, 4, "F")
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      const welcomeLines = pdf.splitTextToSize(welcomeText, contentWidth - 20)
      pdf.text(welcomeLines, pageWidth / 2, y + 14, { align: "center", maxWidth: contentWidth - 20 })
      y += 44

      // ========== FIXED 2x2 GRID - NO SPRAWL ==========
      const categories: Category[] = ["Generator", "Reflector", "Connector", "Ignitor"]
      const colors: Record<Category, [number, number, number]> = {
        Generator: [1, 160, 182],
        Reflector: [21, 203, 217],
        Connector: [178, 191, 197],
        Ignitor: [209, 9, 128],
      }

      // Find highest score for dominant highlight
      const highestScore = Math.max(...categories.map(c => scores[c]))
      const lowestScore = Math.min(...categories.map(c => scores[c]))
      
      // FIXED DIMENSIONS - Calculate available space and lock boxes
      const footerHeight = 70 // Reserve space for footer
      const flexSectionHeight = 55 // Reserve space for Flexing section
      const availableHeight = pageHeight - y - margin - footerHeight - flexSectionHeight
      
      // 2x2 Grid with FIXED heights - no overflow
      const boxW = (contentWidth - 8) / 2
      const boxH = (availableHeight - 8) / 2 // Split available height equally
      const boxGap = 8

      for (let i = 0; i < 4; i++) {
        const category = categories[i]
        const col = i % 2
        const row = Math.floor(i / 2)
        const boxX = margin + col * (boxW + boxGap)
        const boxY = y + row * (boxH + boxGap)
        
        const isDominant = scores[category] === highestScore
        const isLeastDominant = scores[category] === lowestScore
        const imgOpacity = isLeastDominant ? 0.3 : 1.0

        // Box background - FIXED HEIGHT, content must fit
        pdf.setFillColor(18, 18, 18)
        
        // Border - thick neon teal ONLY for dominant
        if (isDominant) {
          pdf.setDrawColor(0, 206, 209)
          pdf.setLineWidth(3)
        } else {
          pdf.setDrawColor(45, 45, 45)
          pdf.setLineWidth(1)
        }
        
        pdf.roundedRect(boxX, boxY, boxW, boxH, 5, 5, "FD")

        // === HEADER ROW: Name (left) + Score (right) ===
        pdf.setTextColor(...colors[category])
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.text(category, boxX + 6, boxY + 15)
        
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.text(`${scores[category]}/40`, boxX + boxW - 45, boxY + 15)

        // === IMAGE: Left side, below header ===
        const imgW = 55
        const imgH = 42
        await drawImageWithOpacity(
          PERSONALITY_IMAGES[category],
          boxX + 4,
          boxY + 22,
          imgW,
          imgH,
          imgOpacity
        )

        // === NARRATIVE: Right of image, scaled to fit ===
        const textX = boxX + imgW + 8
        const textW = boxW - imgW - 14
        const narrativeMaxLines = 6 // Lock to max lines
        
        pdf.setTextColor(isLeastDominant ? 130 : 200, isLeastDominant ? 130 : 200, isLeastDominant ? 130 : 200)
        pdf.setFontSize(8.5)
        pdf.setFont("helvetica", "normal")
        const narrativeLines = pdf.splitTextToSize(categoryDescriptions[category].strengths, textW)
        const clippedNarrative = narrativeLines.slice(0, narrativeMaxLines)
        pdf.text(clippedNarrative, textX, boxY + 30, { lineHeightFactor: 1.2 })

        // === UNDER PRESSURE: Fixed position at bottom of box ===
        const pressureBoxH = 38
        const pressureY = boxY + boxH - pressureBoxH - 4
        
        pdf.setFillColor(22, 22, 22)
        pdf.setDrawColor(209, 9, 128)
        pdf.setLineWidth(1.5)
        pdf.roundedRect(boxX + 4, pressureY, boxW - 8, pressureBoxH, 3, 3, "FD")

        pdf.setTextColor(209, 9, 128)
        pdf.setFontSize(7.5)
        pdf.setFont("helvetica", "bold")
        pdf.text("BE MINDFUL UNDER PRESSURE...", boxX + 8, pressureY + 10)

        pdf.setTextColor(165, 165, 165)
        pdf.setFontSize(7.5)
        pdf.setFont("helvetica", "normal")
        const pressureLines = pdf.splitTextToSize(categoryDescriptions[category].underPressure, boxW - 18)
        const clippedPressure = pressureLines.slice(0, 2) // Max 2 lines
        pdf.text(clippedPressure, boxX + 8, pressureY + 20, { lineHeightFactor: 1.15 })
      }

      // Move y past the grid
      y += 2 * boxH + boxGap + 10

      // ========== FLEXING YOUR APPROACH - FIXED POSITION ==========
      pdf.setTextColor(1, 160, 182)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text("Flexing Your Approach", margin, y)
      y += 12

      pdf.setTextColor(180, 180, 180)
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      const flexText = "Great communication is about making a choice to positively impact every conversation by creating a sense of being alike. The best communicators pick up on clues and adjust their style accordingly. By understanding your dominant preferences and being aware of others, you can flex your approach to build stronger connections."
      const flexLines = pdf.splitTextToSize(flexText, contentWidth)
      pdf.text(flexLines.slice(0, 3), margin, y, { lineHeightFactor: 1.2 })

      // Footer - centered contact details
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text("hello@Elev-8.co.uk  |  0333 404 8888", pageWidth / 2, pageHeight - 28, { align: "center" })
      pdf.setFontSize(7)
      pdf.text("Powered by the Elev-8 behavioural preference model", pageWidth / 2, pageHeight - 16, { align: "center" })

      pdf.save(`illuminate-profile${userData.name ? `-${userData.name.toLowerCase().replace(/\s+/g, "-")}` : ""}.pdf`)
      
      // Show success modal after download
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8"
    >
      <div className="max-w-4xl mx-auto" ref={resultsRef}>
        {/* Logo - Top left, 40px height, p-6 padding */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 -m-6 mb-4"
        >
          <Image
            src={ICONS.elev8Logo}
            alt="Elev-8"
            width={100}
            height={40}
            priority
            loading="eager"
            className="opacity-90"
            style={{ width: 'auto', height: '40px', maxHeight: '40px' }}
          />
        </motion.div>

        {/* Header with Badge - Title - Badge layout */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12 mt-12"
        >
          {/* Badge - Title - Badge row */}
          <div className="flex flex-row items-center justify-center gap-6 mb-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 blur-xl bg-[#01A0B6]/20 rounded-full" />
              <Image
                src={ICONS.rosette}
                alt="Achievement"
                width={50}
                height={50}
                className="relative"
                style={{ width: '50px', height: '50px' }}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Your Communication Profile
            </h1>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 blur-xl bg-[#01A0B6]/20 rounded-full" />
              <Image
                src={ICONS.rosette}
                alt="Achievement"
                width={50}
                height={50}
                className="relative"
                style={{ width: '50px', height: '50px' }}
              />
            </div>
          </div>
{userData.name && (
                <p className="text-[#01A0B6] text-xl mb-2">{userData.name}</p>
          )}
          <p className="text-muted-foreground text-lg">
            Here&apos;s what makes you unique
          </p>
        </motion.div>

        {/* Radar Chart - Mobile responsive with extra padding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 px-8 md:px-6 mb-8"
          id="radar-chart-container"
        >
          <h3 className="text-lg font-semibold mb-4 text-center">Your Profile at a Glance</h3>
          <div className="h-[300px] w-full max-w-[400px] mx-auto sm:max-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#475059" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "#F2F2F2", fontSize: 11 }}
                  className="text-[10px] sm:text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 40]} 
                  tick={{ fill: "#B2BFC5", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#01A0B6"
                  fill="#01A0B6"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Score Bars */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold mb-6">Your Scores</h3>
          <div className="space-y-4">
            {(Object.entries(scores) as [Category, number][]).map(
              ([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{score}/40</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 40) * 100}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={`h-full rounded-full ${categoryDescriptions[category].color}`}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Dominant Preferences */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Image src={ICONS.star} alt="" width={24} height={24} />
            Your Dominant Preferences
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {dominantPreferences.map((category) => (
              <Card
                key={category}
                className="overflow-hidden border-0"
              >
                {/* Hero image */}
                <div className="relative h-40 w-full">
                  <Image
                    src={PERSONALITY_IMAGES[category]}
                    alt={category}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <h4 className="text-2xl font-bold text-white">
                      {category}
                    </h4>
                    <span className="text-3xl font-bold text-white/90">
                      {scores[category]}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className={`p-5 ${categoryDescriptions[category].bgColor}`}>
                  <p className="text-foreground/90 text-sm leading-relaxed mb-4">
                    {categoryDescriptions[category].strengths}
                  </p>
                  {/* Under Pressure box with neon border */}
                  <div className="bg-[#1a1a1a] border-2 border-[#D10980]/50 rounded-lg p-4">
                    <p className="text-xs font-bold text-[#D10980] mb-2 uppercase tracking-wide">
                      Be mindful as under pressure...
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {categoryDescriptions[category].underPressure}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Least Dominant */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Image src={ICONS.signpost} alt="" width={24} height={24} />
            Less Dominant Preferences
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {leastDominant.map((category) => (
              <Card
                key={category}
                className="overflow-hidden border-0"
              >
                {/* Hero image at 30% opacity */}
                <div className="relative h-32 w-full">
                  <Image
                    src={PERSONALITY_IMAGES[category]}
                    alt={category}
                    fill
                    className="object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <h4 className="text-xl font-bold text-white/70">
                      {category}
                    </h4>
                    <span className="text-2xl font-bold text-white/50">
                      {scores[category]}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4 bg-card">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {categoryDescriptions[category].strengths}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Flexing Your Approach */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Image src={ICONS.target} alt="" width={24} height={24} />
            Flexing Your Approach
          </h3>
          <p className="text-foreground/90 leading-relaxed">
            The best communicators pick up on clues given by others and adjust their style accordingly, 
            even when it isn&apos;t their own preference. By understanding your dominant preferences and 
            being aware of others, you can flex your approach to build stronger connections and achieve 
            better outcomes.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            size="lg"
            className="bg-[#01A0B6] hover:bg-[#01A0B6]/90 text-black font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,206,209,0.5)] hover:shadow-[0_0_25px_rgba(0,206,209,0.7)] disabled:shadow-none disabled:hover:scale-100"
          >
            <Download className="mr-2 w-4 h-4" />
            {isGeneratingPdf ? "Generating PDF..." : "Download & Share"}
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="border-border hover:bg-muted transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            Take Again
          </Button>
        </motion.div>

        {/* Success Modal with Confetti */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setShowSuccessModal(false)}
            >
              {/* Confetti Particles */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                      y: -20,
                      rotate: 0,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                      y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
                      rotate: Math.random() * 720 - 360,
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800)
                    }}
                    transition={{ 
                      duration: Math.random() * 2 + 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                    className={`absolute w-3 h-3 ${i % 2 === 0 ? 'bg-[#00ced1]' : 'bg-[#D10980]'} ${i % 3 === 0 ? 'rounded-full' : 'rounded-sm'}`}
                    style={{ 
                      boxShadow: i % 2 === 0 
                        ? '0 0 10px rgba(0,206,209,0.8)' 
                        : '0 0 10px rgba(209,9,128,0.8)'
                    }}
                  />
                ))}
              </div>

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-black/90 backdrop-blur-xl border-2 border-[#00ced1] rounded-2xl p-8 max-w-lg w-full relative shadow-[0_0_40px_rgba(0,206,209,0.3)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Pulsing Checkmark Icon */}
                <div className="text-center mb-6">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00ced1]/20 mb-4 shadow-[0_0_30px_rgba(0,206,209,0.5)]"
                  >
                    <CheckCircle className="w-10 h-10 text-[#00ced1]" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Success! Your Illuminate Profile is ready.
                  </h2>
                  <p className="text-white/80">
                    Well done{userData.name ? `, ${userData.name}` : ''}! Your personal roadmap has been generated and saved to your device.
                  </p>
                </div>

                {/* Important Notice Box */}
                <div className="bg-[#00ced1]/10 border border-[#00ced1]/50 rounded-xl p-4 mb-5">
                  <p className="text-sm font-bold text-[#00ced1] mb-2">IMPORTANT</p>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Please bring this PDF with you to your session later. We will be using these specific insights to help you flex your approach.
                  </p>
                </div>

                {/* Sharing Instructions Box */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-white mb-2">Share your results:</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    If Elev-8 are coordinating on your behalf, feel free to email your results to{" "}
                    <a href="mailto:hello@Elev-8.co.uk" className="text-[#00ced1] hover:underline font-medium">
                      hello@Elev-8.co.uk
                    </a>
                  </p>
                </div>

                {/* Neon CTA Button */}
                <Button
                  onClick={() => {
                    setShowSuccessModal(false)
                    onRestart()
                  }}
                  className="w-full bg-[#00ced1] hover:bg-[#00ced1] text-black font-bold py-6 text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(0,206,209,0.6)] hover:shadow-[0_0_30px_rgba(0,206,209,0.8)]"
                >
                  Return to Home
                </Button>

                {/* Footer Attribution */}
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-white/50 text-sm mb-1">
                    hello@Elev-8.co.uk | 0333 404 8888
                  </p>
                  <p className="text-white/30 text-xs">
                    Powered by the Elev-8 behavioural preference model
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center border-t border-border pt-8"
        >
          <p className="text-muted-foreground mb-4">
            Want deeper insights into your communication style?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:hello@Elev-8.co.uk"
              className="flex items-center gap-2 text-[#01A0B6] hover:text-[#15CBD9] transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@Elev-8.co.uk
            </a>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <a
              href="tel:03334048888"
              className="flex items-center gap-2 text-[#01A0B6] hover:text-[#15CBD9] transition-colors"
            >
              <Phone className="w-4 h-4" />
              0333 404 8888
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Powered by the Elev-8 behavioral preference model
          </p>
        </motion.footer>
      </div>
    </motion.div>
  )
}
