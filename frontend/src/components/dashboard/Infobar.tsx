import { Cloud } from "lucide-react"

const Infobar = () => {
  return (
    <div className="w-full text-(--color-3) flex items-center justify-end gap-5 text-xs px-2.5 py-1.5 bg-(--color-1)">
      <div>
        Sat, 15 Aug, 2026
      </div>
      <div>
        14:41:32
      </div>
      <div className="flex items-center gap-1.5">
        <Cloud size={16} />
        Rain • 22 °C
      </div>
    </div>
  )
}

export default Infobar