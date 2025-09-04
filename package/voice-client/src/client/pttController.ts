// voice-client/src/client/PttController.ts
export class PttController {
    private micTrack!: MediaStreamTrack;
    private dataChannel!: RTCDataChannel;

    bind(mediaStream: MediaStream, dataChannel: RTCDataChannel) {
        this.micTrack = mediaStream.getAudioTracks()[0];
        this.micTrack.enabled = false;
        this.dataChannel = dataChannel;
    }

    onPress() {
        this.micTrack.enabled = true;

        if (this.dataChannel.readyState === "open") {
            this.dataChannel.send(JSON.stringify({ type: "response.cancel" }));
            this.dataChannel.send(JSON.stringify({ type: "output_audio_buffer.clear" }));
        }

        if ("speechSynthesis" in window) speechSynthesis.cancel();
    }

    onRelease() {
        this.micTrack.enabled = false;

        if (this.dataChannel.readyState === "open") {
            this.dataChannel.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
            this.dataChannel.send(JSON.stringify({ type: "response.create", response: {} }));
        }
    }
}
