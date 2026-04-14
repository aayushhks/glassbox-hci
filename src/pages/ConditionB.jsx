import { ExperimentWrapper } from '../components/Experiment'
import { GlassBox } from '../components/GlassBox'

export default function ConditionB() {
  const handleComplete = (data) => {
    const existing = JSON.parse(localStorage.getItem('glassbox-results') || '[]')
    existing.push(data)
    localStorage.setItem('glassbox-results', JSON.stringify(existing))
    console.log('Condition B complete:', data)
  }

  return (
    <ExperimentWrapper
      condition="B"
      InterfaceComponent={GlassBox}
      onComplete={handleComplete}
    />
  )
}
