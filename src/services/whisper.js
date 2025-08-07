const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const WHISPER_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3';
const CORRECT_TEXT_API_URL = 'https://api-inference.huggingface.co/models/vistec/ttc-finetuned-gen2-thai';

/**
 * ถอดเสียงจากไฟล์เสียงด้วย Whisper
 */
export const transcribeAudio = async (audioBlob) => {
  try {
    const audioArrayBuffer = await audioBlob.arrayBuffer();

    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'audio/webm'
      },
      body: audioArrayBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Whisper API Error: ', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

/**
 * ปรับคำผิดให้ถูกต้องและดูเป็นทางการขึ้น ด้วยโมเดล Thai LLM
 */
export const generateSummary = async (transcript) => {
  try {
    const response = await fetch(CORRECT_TEXT_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `ช่วยปรับข้อความให้ถูกต้องและเป็นทางการ:\n${transcript}`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Text Correction API Error: ', errorText);
      return transcript;
    }

    const result = await response.json();
    return result[0]?.generated_text || transcript;
  } catch (error) {
    console.error('Error correcting text:', error);
    return transcript;
  }
};
