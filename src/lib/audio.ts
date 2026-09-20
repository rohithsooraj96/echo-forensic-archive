let context: AudioContext | null = null
let muted = true

export function setAudioMuted(value: boolean) {
  muted = value
}

export function initializeAudio() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  context ??= new AudioContext()
  void context.resume()
}

export function ping(frequency = 440, duration = 0.06) {
  if (!context || muted) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration + 0.01)
}

/** A low sweep followed by a soft lock-on click for the camera flight. */
export function connectionSweep() {
  if (!context || muted) return
  const now = context.currentTime
  const sweep = context.createOscillator()
  const sweepGain = context.createGain()
  sweep.type = 'sine'
  sweep.frequency.setValueAtTime(92, now)
  sweep.frequency.exponentialRampToValueAtTime(310, now + 0.78)
  sweepGain.gain.setValueAtTime(0.0001, now)
  sweepGain.gain.exponentialRampToValueAtTime(0.055, now + 0.12)
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82)
  sweep.connect(sweepGain).connect(context.destination)
  sweep.start(now)
  sweep.stop(now + 0.84)

  const click = context.createOscillator()
  const clickGain = context.createGain()
  click.type = 'triangle'
  click.frequency.setValueAtTime(860, now + 0.92)
  clickGain.gain.setValueAtTime(0.0001, now + 0.9)
  clickGain.gain.exponentialRampToValueAtTime(0.045, now + 0.925)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.02)
  click.connect(clickGain).connect(context.destination)
  click.start(now + 0.9)
  click.stop(now + 1.04)
}
