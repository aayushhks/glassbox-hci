import { ExperimentWrapper } from '../components/Experiment'
import { ChatControl } from '../components/ChatControl'

export default function ConditionA() {
  const handleComplete = (data) => {
    // Store in localStorage for the Results page
    const existing = JSON.parse(localStorage.getItem('glassbox-results') || '[]')
    existing.push(data)
    localStorage.setItem('glassbox-results', JSON.stringify(existing))
    console.log('Condition A complete:', data)
  }

  return (
    <ExperimentWrapper
      condition="A"
      InterfaceComponent={ChatControl}
      onComplete={handleComplete}
    />
  )
}
