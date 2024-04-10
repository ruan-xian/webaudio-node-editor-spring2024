import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class EditorGainNode extends Classic.Node<
    {
        signal: Classic.Socket
        additionalGain: Classic.Socket
    },
    { signal: Classic.Socket },
    { baseGain: Classic.InputControl<'number', number> }
> {
    width = 180
    height = 220
    constructor(change: () => void, initial?: { gain: number }) {
        super('Gain')

        let signalInput = new Classic.Input(socket, 'Signal', true)

        this.addInput('signal', signalInput)

        let gainInput = new Classic.Input(socket, 'Additional Gain', true)
        this.addInput('additionalGain', gainInput)

        this.addControl(
            'baseGain',
            new LabeledInputControl(
                initial ? initial.gain : 1,
                'Base Gain',
                change,
                0.1
            )
        )

        this.addOutput('signal', new Classic.Output(socket, 'Signal'))
    }

    data(inputs: {
        signal?: AudioNode[]
        baseGain?: AudioNode[]
        additionalGain?: AudioNode[]
    }): { signal: AudioNode } {
        const gainNode = audioCtx.createGain()
        const gainControl = this.controls.baseGain.value

        if (inputs.signal) {
            inputs.signal.forEach((itm) => itm.connect(gainNode))
        }

        if (inputs.baseGain) {
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            inputs.baseGain[0].connect(gainNode.gain)
        } else {
            gainNode.gain.setValueAtTime(
                gainControl || 0,
                audioCtx.currentTime
            )
        }

        if (inputs.additionalGain) {
            inputs.additionalGain.forEach((itm) => itm.connect(gainNode.gain))
        }

        return {
            signal: gainNode,
        }
    }

    serialize() {
        return {
            gain: this.controls.baseGain.value,
        }
    }
}
