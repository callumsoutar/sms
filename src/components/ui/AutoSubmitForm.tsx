'use client';

import React, { useRef, useEffect } from 'react';

interface AutoSubmitFormProps {
  children: React.ReactNode;
  action?: string;
  method?: string;
  className?: string;
}

export default function AutoSubmitForm({
  children,
  action = '',
  method = 'get',
  className = '',
}: AutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Add event listeners to all select elements to auto-submit the form
  useEffect(() => {
    if (!formRef.current) return;

    const selectElements = formRef.current.querySelectorAll('select');
    
    const handleChange = () => {
      formRef.current?.submit();
    };

    selectElements.forEach(select => {
      select.addEventListener('change', handleChange);
    });

    return () => {
      selectElements.forEach(select => {
        select.removeEventListener('change', handleChange);
      });
    };
  }, []);

  return (
    <form 
      ref={formRef} 
      action={action} 
      method={method} 
      className={className}
    >
      {children}
    </form>
  );
} 