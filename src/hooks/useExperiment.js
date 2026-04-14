import { useState, useRef, useCallback } from 'react'

/**
 * Tracks experiment session data: timing, interactions, and survey responses.
 * Used across both Condition A and Condition B.
 */
export function useExperiment(conditionId) {
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const startTimeRef = useRef(null)
  const interactionsRef = useRef([])

  const startSession = useCallback(() => {
    startTimeRef.current = Date.now()
    interactionsRef.current = []
    setIsActive(true)
    setIsComplete(false)
  }, [])

  const logInteraction = useCallback((type, detail = {}) => {
    if (!startTimeRef.current) return
    interactionsRef.current.push({
      type,
      detail,
      timestamp: Date.now(),
      elapsed: Date.now() - startTimeRef.current,
    })
  }, [])

  const endSession = useCallback(() => {
    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    setIsActive(false)
    setIsComplete(true)
    return {
      conditionId,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      durationMs: duration,
      interactions: interactionsRef.current,
      totalInteractions: interactionsRef.current.length,
    }
  }, [conditionId])

  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Date.now() - startTimeRef.current
  }, [])

  return {
    isActive,
    isComplete,
    startSession,
    logInteraction,
    endSession,
    getElapsed,
  }
}
