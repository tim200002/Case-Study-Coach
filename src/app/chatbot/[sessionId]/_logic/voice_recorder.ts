import { env } from "~/env.mjs";
import { Socket, io } from "socket.io-client";

const RECORDING_RATE = 500;

export type TranscriptResponse = {
  transcript: string;
  isFinal: boolean;
  speechClarity?: number;
  averageSpeedWPMCurrent?: number;
  averageSpeedWPM?: number;
};

export enum VoiceRecorderState {
  IDLE,
  RECORDING,
}
export class VoiceRecorder {
  state: VoiceRecorderState = VoiceRecorderState.IDLE;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private socket: Socket | null = null;
  private transcriptHistory: TranscriptResponse[] = [];

  public onTranscriptChange: (transcripts: TranscriptResponse[]) => void;

  constructor(onTranscriptChange: (transcripts: TranscriptResponse[]) => void) {
    this.onTranscriptChange = onTranscriptChange;
  }

  private async setupRecordingDevices(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      if (!this.stream) {
        return false;
      }

      this.recorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm",
      });

      if (!this.recorder) {
        return false;
      }

      this.state = VoiceRecorderState.IDLE;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private setupSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log(
        "Socket already initialized before setup. This should not be the case.",
      );
    }

    this.socket = io(env.NEXT_PUBLIC_TRANSCRIPTION_SERVER_URL);
    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("transcript", (transcriptResponse: TranscriptResponse) => {
      if (transcriptResponse.isFinal) {
        this.transcriptHistory.push(transcriptResponse);
        this.onTranscriptChange(this.transcriptHistory);
      } else {
        this.onTranscriptChange([
          ...this.transcriptHistory,
          transcriptResponse,
        ]);
      }
    });

    this.socket.on("server_completed", () => {
      console.log("Server completed");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  async startRecording(): Promise<boolean> {
    if (this.state !== VoiceRecorderState.IDLE) {
      throw new Error(
        "Cannot start recording when not ready. Current state: " + this.state,
      );
    }

    console.log("Setting up recording devices");
    const successSetupRecordingDevices = await this.setupRecordingDevices();
    if (!successSetupRecordingDevices) {
      return false;
    }
    console.log("Finished setting up recording devices");

    console.log("Setting up socket");
    this.setupSocket();
    console.log("Finished setting up socket");

    console.log("Starting recording");
    this.recorder!.addEventListener("dataavailable", (event) => {
      this.socket!.emit("audio", event.data);
    });

    this.recorder!.start(RECORDING_RATE);
    this.state = VoiceRecorderState.RECORDING;
    return true;
  }

  async stopRecording(): Promise<void> {
    console.log("Stopping recording");
    if (this.state !== VoiceRecorderState.RECORDING) {
      throw new Error(
        "Cannot stop recording when not recording. Current state: " +
          this.state,
      );
    }

    // stop recording
    this.recorder!.stop();
    this.recorder?.stream.getTracks().forEach((track) => track.stop());

    // wait short amount
    await new Promise((resolve) => setTimeout(resolve, 100));

    await new Promise(async (resolve) => {
      this.socket!.on("server_completed", () => {
        resolve(null);
      });

      // send transcript finish event
      this.socket!.emit("client_completed");
    });

    // disconnect socket
    this.socket!.disconnect();

    this.state = VoiceRecorderState.IDLE;
  }
}
