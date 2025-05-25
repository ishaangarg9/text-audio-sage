
import React from 'react';

const Index = () => {
  return (
    <div className="w-full h-[900px]">
      <iframe
        src="http://localhost:3999"
        width="100%"
        height="100%"
        style={{
          border: 'none',
        }}
        allowFullScreen
      />
    </div>
  );
};

export default Index;
