import { LiveProvider, LiveError, LivePreview } from 'react-live'
import { useState, useEffect } from 'react'

export default function GeneratedFeed({ jsx, data, onEvent }) {
  if (!jsx) return null

  const scope = { useState, useEffect, data, onEvent }

  return (
    <div className="generated-feed-wrapper">
      <LiveProvider code={jsx} scope={scope} noInline={true}>
        <LiveError className="mx-4 my-3 p-4 bg-red-950 border border-red-800 rounded text-red-300 text-xs font-mono whitespace-pre-wrap" />
        <LivePreview />
      </LiveProvider>
    </div>
  )
}
