import { useScreenMode } from './device/useScreenMode'
import { Room } from './scene/Room'
import { PhoneStub } from './screens/PhoneStub'
import { RotateScreen } from './screens/RotateScreen'

export function App() {
  const mode = useScreenMode()
  if (mode === 'phone') return <PhoneStub />
  if (mode === 'rotate') return <RotateScreen />
  return <Room />
}
