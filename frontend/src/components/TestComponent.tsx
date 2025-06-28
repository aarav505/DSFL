import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent rendered');
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-orange-600">Test Component Loaded!</h1>
    </div>
  );
};

export default TestComponent;
