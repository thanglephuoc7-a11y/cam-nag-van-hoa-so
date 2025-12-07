
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Cẩm Nang Văn Hóa Số. All rights reserved.</p>
        <p className="text-sm mt-1">Tác giả: Lê Phước Tình</p>
        <div className="mt-2 text-xs text-gray-400">
          <p>Nguồn tham khảo chính:</p>
          <ul className="flex justify-center space-x-4 mt-1">
            <li>Luật An ninh mạng 2018</li>
            <li>Luật Sở hữu trí tuệ</li>
            <li>SGK GDCD & Tin học</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
