import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

// ব্যাকএন্ডে কল করার ফাংশন
const classifyGraphAPI = async (edges) => {
  const response = await fetch(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ edges }),
  });

  if (!response.ok) {
    throw new Error('Classification failed');
  }
  return response.json();
};

export const useGraphClassification = () => {
  // useMutation (react-query) ব্যবহার করা
  const { mutateAsync, data, isPending, isError, error } = useMutation({
    mutationFn: classifyGraphAPI,
  });

  const classifyGraph = useCallback(async (edges) => {
    try {
      await mutateAsync(edges);
    } catch (err) {
      // এরর হ্যান্ডেলিং (যেমন: console.log)
      console.error(err);
    }
  }, [mutateAsync]);

  const resetClassification = useCallback(() => {
    // react-query state রিসেট করতে পারে, কিন্তু এখানে সিম্পল রাখছি
  }, []);

  return {
    classification: data, // react-query থেকে আসা ডেটা
    loading: isPending, // react-query থেকে লোডিং স্টেট
    error: isError ? error : null, // react-query থেকে এরর স্টেট
    classifyGraph,
    resetClassification,
  };
};