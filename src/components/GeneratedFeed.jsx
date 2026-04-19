import { useState, useEffect, Component } from 'react'
import * as React from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(e) {
    return { error: e.message }
  }
  render() {
    if (this.state.error) return (
      <div className="mx-4 my-3 p-4 bg-red-950 border border-red-800 rounded text-red-300 text-xs font-mono whitespace-pre-wrap">
        <strong>Runtime error:</strong> {this.state.error}
      </div>
    )
    return this.props.children
  }
}

export default function GeneratedFeed({ jsx, data, onEvent }) {
  const [FeedComponent, setFeedComponent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jsx) return
    setError(null)
    setFeedComponent(null)

    // Wait for Babel CDN script to be ready
    if (!window.Babel) {
      setError('Babel not loaded yet — refresh the page')
      return
    }

    try {
      // Strip render() call — we render the component ourselves
      const code = jsx.replace(/\nrender\s*\(.*\)\s*;?\s*$/, '').trim()

      // Full JSX → JS compilation via Babel (handles all modern JS, no buble limits)
      const { code: compiled } = window.Babel.transform(code, {
        presets: ['react'],
        filename: 'SportsFeed.jsx',
      })

      // Inject scope variables via Function constructor
      // eslint-disable-next-line no-new-func
      const factory = new Function(
        'React', 'useState', 'useEffect', 'data', 'onEvent',
        `${compiled}\nreturn typeof SportsFeed !== 'undefined' ? SportsFeed : null;`
      )

      const Comp = factory(React, React.useState, React.useEffect, data, onEvent)
      if (!Comp) throw new Error('SportsFeed not found in generated code')

      setFeedComponent(() => Comp)
    } catch (e) {
      console.error('Feed compile error:', e)
      setError(e.message)
    }
  }, [jsx])

  if (!jsx) return null

  if (error) return (
    <div className="mx-4 my-3 p-4 bg-red-950 border border-red-800 rounded text-red-300 text-xs font-mono whitespace-pre-wrap">
      <strong>Compile error:</strong> {error}
    </div>
  )

  if (!FeedComponent) return (
    <div className="flex items-center justify-center h-32">
      <div className="text-[#8a8a8a] text-sm">Rendering feed...</div>
    </div>
  )

  return (
    <ErrorBoundary>
      <FeedComponent />
    </ErrorBoundary>
  )
}
