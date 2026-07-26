import { parseGeneratedComponent, extractComponentName } from "./runtime/babel/parser";

const realGeminiOutput = `
import React, { useState } from 'react';

interface PaymentFormProps {
  onSubmit?: (data: { cardNumber: string; expiry: string; cvc: string }) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ cardNumber: '', expiry: '', cvc: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8">
      <form onSubmit={handleSubmit}>
        <button type="submit">Confirm Payment</button>
      </form>
    </div>
  );
};
`;

const parsed = parseGeneratedComponent(realGeminiOutput);
console.log("PARSE RESULT VALID:", parsed.valid);

if (parsed.valid) {
  const name = extractComponentName(parsed.ast);
  console.log("EXTRACTED COMPONENT NAME:", name);
}