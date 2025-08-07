import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react';
import { transcribeAudio, generateSummary } from '../services/whisper';
import { createNote } from '../services/supabase';

const Recorder = ({ onNoteCreated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleTranscribe = async () => {
    if (!recordedBlob) return;

    setIsProcessing(true);
    try {
      const transcript = await transcribeAudio(recordedBlob);
      const summary = await generateSummary(transcript);

      const { data, error } = await createNote(transcript, summary, '');

      if (error) {
        throw new Error(error.message);
      }

      setRecordedBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      onNoteCreated?.();

      const successModal = document.getElementById('success_modal');
      successModal?.showModal();
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body text-center">
        <h2 className="card-title justify-center mb-4">Voice Recorder</h2>

        {!recordedBlob ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className={`p-6 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-error/20 animate-pulse' 
                  : 'bg-primary/10 hover:bg-primary/20'
              }`}>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`btn btn-circle btn-lg ${
                    isRecording ? 'btn-error' : 'btn-primary'
                  }`}
                  disabled={isProcessing}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {isRecording && (
              <div className="space-y-2">
                <div className="text-2xl font-mono text-error">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-base-content/70">Recording...</div>
              </div>
            )}

            {!isRecording && (
              <p className="text-base-content/70">
                Tap the microphone to start recording your voice memo
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-4">
              <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
              <div className="flex gap-2">
                <button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  className="btn btn-sm btn-outline"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlaying(false);
                setIsPaused(false);
              }}
              className="hidden"
            />

            <div className="flex gap-2 justify-center">
              <button
                onClick={discardRecording}
                className="btn btn-outline btn-error"
                disabled={isProcessing}
              >
                Discard
              </button>
              <button
                onClick={handleTranscribe}
                className="btn btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  'Save & Transcribe'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <dialog id="success_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-success">Success!</h3>
          <p className="py-4">Your voice memo has been transcribed and saved successfully.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Recorder;
