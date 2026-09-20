import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { ActionButton } from './Primitives'

interface Props {
  name: string
  children: ReactNode
}

interface State {
  error: Error | null
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ECHO visualization boundary caught an error in ${this.props.name}`, error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return <section className="visualization-error" role="alert" data-testid={`visualization-error-${this.props.name.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="eyebrow text-coral">VISUALIZATION UNAVAILABLE</p>
      <h2>{this.props.name} could not render.</h2>
      <p>The archive shell is still available. Retry this analytical layer or continue with another world.</p>
      <ActionButton variant="ghost" onClick={this.reset}><RotateCcw size={14} /> RETRY LAYER</ActionButton>
    </section>
    return this.props.children
  }
}
