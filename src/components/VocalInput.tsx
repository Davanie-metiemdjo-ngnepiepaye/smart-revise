import { useState } from "react";

export default function VocalInput({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("🎤 La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      alert("❌ Erreur lors de la reconnaissance vocale.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button
      type="button"
      onClick={startRecognition}
      className="text-gray-400 hover:text-black ml-2"
      title="Dicter"
    >
      {listening ? "🎙️..." : "🎙️"}
    </button>
  );
}
