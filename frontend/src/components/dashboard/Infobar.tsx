import { Cloud, Sun, CloudRain } from "lucide-react"
import { useState, useEffect } from "react"

const Infobar = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  // Simple static weather for now based on hour
  const isDay = time.getHours() > 6 && time.getHours() < 18
  const WeatherIcon = isDay ? Sun : Cloud

  return (
    <div className="w-full text-(--color-3) flex items-center justify-end gap-5 text-xs px-2.5 py-1.5 bg-(--color-1)">
      <div>
        {dateFormatter.format(time)}
      </div>
      <div className="w-16 font-mono">
        {timeFormatter.format(time)}
      </div>
      <div className="flex items-center gap-1.5">
        <WeatherIcon size={16} />
        {isDay ? 'Clear' : 'Cloudy'} • 24 °C
      </div>
    </div>
  )
}

export default Infobar