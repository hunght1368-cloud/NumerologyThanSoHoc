
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [text, setText] = useState("Đang kết nối với tần số của bạn...");
  const messages = [
    "Khởi tạo bản đồ tâm thức...",
    "Giải mã các rung động con số...",
    "Định hình sắc màu năng lượng...",
    "Đang chuyển hóa Force thành Power...",
    "Sắp hoàn tất hành trình thấu hiểu..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(messages[i % messages.length]);
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-16 h-16 border-t-2 border-gray-100 border-solid rounded-full animate-spin mb-8"></div>
      <p className="text-sm tracking-[0.3em] font-light text-gray-400 uppercase animate-pulse">
        {text}
      </p>
      <div className="mt-20 max-w-xs opacity-30 text-[10px] tracking-widest uppercase">
        Vẻ đẹp của sự tĩnh lặng là nơi bắt đầu của mọi sự thấu suốt.
      </div>
    </div>
  );
};

export default LoadingScreen;
