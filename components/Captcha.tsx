'use client';

import { useState, useEffect, useRef } from 'react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export default function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw captcha text
    ctx.font = 'bold 32px Arial';
    ctx.textBaseline = 'middle';

    const spacing = canvas.width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const x = spacing * (i + 1);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Random color for each character
      const colors = ['#1f2937', '#374151', '#4b5563', '#6b7280'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(text[i], 0, 0);

      ctx.restore();
    }

    // Add noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
    drawCaptcha(newCaptcha);
  };

  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    const verified = value === captchaText;
    setIsVerified(verified);
    onVerify(verified);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Verification Code
      </label>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="border border-gray-300 rounded-lg"
          />
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          title="Refresh captcha"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Enter the code above"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
          isVerified
            ? 'border-green-500 focus:ring-green-500 bg-green-50'
            : userInput
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {userInput && (
        <p className={`text-xs ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
          {isVerified ? '✓ Verified' : '✗ Incorrect code'}
        </p>
      )}
    </div>
  );
}
