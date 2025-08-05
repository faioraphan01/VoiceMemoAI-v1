const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const WHISPER_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3';

export const transcribeAudio = async (audioBlob) => {
  try {
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: audioBlob,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const generateSummary = async (transcript) => {
  try {
    // Simple summary generation - you could use a more sophisticated model
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) {
      return transcript;
    }
    
    // For now, return first two sentences as summary
    const summary = sentences.slice(0, 2).join('. ').trim();
    return summary + (summary.endsWith('.') ? '' : '.');
  } catch (error) {
    console.error('Error generating summary:', error);
    return transcript;
  }
};