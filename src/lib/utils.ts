import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable format
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  
  // Use fixed format to avoid hydration errors
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${month}/${day}/${year}, ${hours}:${minutes}`;
};

// Format date without time
export const formatDateOnly = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  
  // Use fixed format to avoid hydration errors
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${month}/${day}/${year}`;
};

// Calculate days remaining or overdue
export const getDaysRemaining = (dueDate: string | null) => {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
