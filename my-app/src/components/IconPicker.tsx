import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { AppText } from './AppText'
import { MED_ICONS, MedIconKey } from './MedIcons'

export const ICON_COLORS = [
  '#EB5A74', '#FFB444', '#6BE3D9', '#4FD1C5', '#F0F0F0',
  '#FF6B9A', '#7ED26B', '#6BC9F2', '#B58CF7', '#FF7F5E',
]

type Props = {
  icon: MedIconKey
  color: string
  hasPhoto?: boolean
  onChangeIcon: (i: MedIconKey) => void
  onChangeColor: (c: string) => void
}

export function IconPicker({ icon, color, hasPhoto = false, onChangeIcon, onChangeColor }: Props) {
  const Preview = MED_ICONS[icon]

  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        {(Object.keys(MED_ICONS) as MedIconKey[]).map(key => {
          const Icon = MED_ICONS[key]
          const selected =  !hasPhoto && key === icon 
          return (
            <TouchableOpacity
              key={key}
              style={[styles.iconBox, selected && styles.iconBoxSelected]}
              onPress={() => onChangeIcon(key)}
            >
              <Icon color={color ?? '#EB5A74'} size={50} />
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bottom}>
        <View>
          <AppText>Cores:</AppText>
          <View style={styles.palette}>
            {ICON_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => onChangeColor(c)}
                style={[styles.swatch, { backgroundColor: c }, !hasPhoto && c === color && styles.swatchSelected]}
              />
            ))}
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          <AppText style={{fontSize: 14}}>Pré-visualização:</AppText>
          <View style={styles.previewBox}>
            <Preview color={color} size={60} />
          </View>
        </View>
      </View>
    </View>
  )
}

export const DEFAULT_ICON_COLOR = '#EB5A74'

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 21, padding: 16, marginVertical: 10 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  iconBox: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: { backgroundColor: '#DEE6E6', borderWidth: 2, borderColor: '#198982' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', width: 5 * 40, marginTop: 8 },
  swatch: { width: 32, height: 32, borderRadius: 10, margin: 4 },
  swatchSelected: { borderWidth: 3, borderColor: '#198982' },
  previewBox: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#DEE6E6', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
})