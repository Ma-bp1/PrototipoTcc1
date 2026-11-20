import { useId } from 'react'
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Circle,
  Rect,
} from 'react-native-svg'

type IconProps = { color: string; size?: number }

// Gradiente com "corte seco": metade de cima colorida, metade de baixo branca.
// Coordenadas em userSpaceOnUse, iguais às do Figma.
function HalfGradient({
  id,
  color,
  x,
  y1,
  y2,
}: {
  id: string
  color: string
  x: number
  y1: number
  y2: number
}) {
  return (
    <Defs>
      <LinearGradient
        id={id}
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0.5" stopColor={color} />
        <Stop offset="0.5" stopColor="#FFFFFF" />
      </LinearGradient>
    </Defs>
  )
}

export function PillOval({ color, size = 60 }: IconProps) {
  const id = useId().replace(/:/g, '') // id único por instância, sem ":" 
  return (
    <Svg width={size} height={size} viewBox="0 0 42 63" fill="none">
      <HalfGradient id={id} color={color} x={20.869} y1={-0.692} y2={55.14} />
      {/* sombra simplificada */}
      <Ellipse
        cx={20.869}
        cy={31.224}
        rx={15.686}
        ry={27.916}
        rotation={15.562}
        origin="20.869, 31.224"
        fill="#000"
        opacity={0.1}
      />
      <Ellipse
        cx={20.869}
        cy={27.224}
        rx={15.686}
        ry={27.916}
        rotation={15.562}
        origin="20.869, 27.224"
        fill={`url(#${id})`}
      />
    </Svg>
  )
}

export function PillRound({ color, size = 60 }: IconProps) {
  const id = useId().replace(/:/g, '')
  return (
    <Svg width={size} height={size} viewBox="0 0 57 57" fill="none">
      <HalfGradient id={id} color={color} x={28.5} y1={0} y2={49} />
      {/* sombra simplificada */}
      <Circle cx={28.5} cy={28.5} r={24.5} fill="#000" opacity={0.1} />
      <Circle cx={28.5} cy={24.5} r={24.5} fill={`url(#${id})`} />
    </Svg>
  )
}

export function Bottle({ color, size = 60 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* corpo: único que recebe a cor */}
      <Rect x={16.5} y={17} width={27} height={41} rx={5} fill="#000" opacity={0.1} />
      <Rect x={16.5} y={16} width={27} height={41} rx={5} fill={color} />
      {/* tampa: cor fixa */}
      <Rect x={19.5} y={6} width={21} height={10} rx={1} fill="#ffffff" />
    </Svg>
  )
}

export const MED_ICONS = {
  'pill-oval': PillOval,
  'pill-round': PillRound,
  bottle: Bottle,
} as const

export type MedIconKey = keyof typeof MED_ICONS