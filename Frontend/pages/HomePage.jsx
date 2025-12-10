import faceScan from '../assets/face-scan.png';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-100 to-purple-300 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl animate-ping -z-10" />

      <h1 className="text-5xl font-bold text-purple-900 mb-4 drop-shadow-lg animate-fade-in">
        MoodMirror
      </h1>

      <p className="text-xl text-center max-w-xl text-gray-700 animate-fade-in delay-100">
        A Real-Time Mental Health Companion Mirror for Students Using Multimodal Emotion Detection
      </p>

      <img
        src={faceScan}
        alt="Face Scan"
        className="w-[300px] mt-6 rounded-2xl shadow-2xl transition transform hover:scale-105 hover:rotate-1 hover:shadow-purple-400 duration-300 ease-in-out"
      />
    </div>
  );
}
