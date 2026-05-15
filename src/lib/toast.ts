"use client";

import { showToast } from "nextjs-toast-notify";

const toastOptions = {
  duration: 5000,
  progress: true,
  position: "top-right" as const,
  transition: "topBounce" as const,
  sound: false,
};

export function showSuccessToast(message: string) {
  showToast.success(message, toastOptions);
}

export function showErrorToast(message: string) {
  showToast.error(message, toastOptions);
}
