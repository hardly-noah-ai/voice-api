// voice-client/src/client/VoiceClient.ts
/* unchanged, here for completeness */
import { LlmClient } from "./llmClient";

export class VoiceClient {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly dataChannelName: string;
  private readonly audioConstraints: MediaStreamConstraints;
  public dataChannel!: RTCDataChannel;
  public peerConnection!: RTCPeerConnection;

  constructor(
    private llmClient: LlmClient,
    baseUrl: string = "https://api.openai.com/v1/realtime/calls",
    model: string = "gpt-4o-realtime-preview",
    dataChannelName: string = "oai-events",
    audioConstraints: MediaStreamConstraints = { audio: true }
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.dataChannelName = dataChannelName;
    this.audioConstraints = audioConstraints;
  }

  public async initiatePeerConnection(audioElement: HTMLAudioElement): Promise<void> {
    const key = await this.getEphemeralKey();
    this.peerConnection = await this.setupPeerConnection(audioElement);
    await this.addMediaTrack();
    this.createDataChannel();
    const offer = await this.createOffer();
    const answer = await this.exchangeSdpWithOpenAI(offer, key);
    await this.setRemoteDescription(answer);
  }

  private async getEphemeralKey(): Promise<string> {
    const { value } = await this.llmClient.startConversationSession();
    return value;
  }

  private async setupPeerConnection(audioElement: HTMLAudioElement) {
    const pc = new RTCPeerConnection();
    audioElement.autoplay = true;
    pc.ontrack = (e) => (audioElement.srcObject = e.streams[0]);
    return pc;
  }

  private async addMediaTrack() {
    const stream = await navigator.mediaDevices.getUserMedia(this.audioConstraints);
    this.peerConnection.addTrack(stream.getTracks()[0]);
  }

  private createDataChannel() {
    this.dataChannel = this.peerConnection.createDataChannel(this.dataChannelName);
  }

  private async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  private async exchangeSdpWithOpenAI(offer: RTCSessionDescriptionInit, key: string) {
    const res = await fetch(`${this.baseUrl}?model=${this.model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/sdp",
      },
    });
    return res.text();
  }

  private async setRemoteDescription(sdp: string) {
    await this.peerConnection.setRemoteDescription({ type: "answer", sdp });
  }
}
