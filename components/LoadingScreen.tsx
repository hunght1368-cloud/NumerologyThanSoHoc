
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [text, setText] = useState("Đang kết nối với tần số của bạn...");
  const messages = [
    "Khởi tạo bản đồ tâm thức...",
    "Giải mã các rung động con số...",
    "Định hình sắc màu năng lượng...",
    "Chuyển hóa Áp lực thành Sức mạnh...",
    "Sắp hoàn tất hành trình thấu hiểu..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(messages[i % messages.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-12 h-12 border-t-2 border-black border-solid rounded-full animate-spin mb-8"></div>
      <p className="text-[10px] tracking-[0.4em] font-black text-gray-400 uppercase animate-pulse">
        {text}
      </p>
      <div className="mt-20 max-w-xs opacity-20 text-[9px] tracking-widest uppercase">
        Vẻ đẹp của sự tĩnh lặng là nơi bắt đầu của mọi sự thấu suốt.
      </div>
    </div>
  );
};

export default LoadingScreen;
