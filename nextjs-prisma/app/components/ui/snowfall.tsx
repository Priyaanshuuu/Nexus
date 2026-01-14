"use client"

import Snowfall from "react-snowfall"

export default function SnowfallOverlay() {
  return (
    <Snowfall
      snowflakeCount={180}
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
      speed={[0.5, 1.2]}
      wind={[-0.5, 1]}
      radius={[1.2, 3.2]}
    />
  )
}
