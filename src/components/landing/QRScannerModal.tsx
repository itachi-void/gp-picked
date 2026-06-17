"use client";

import React from "react";
import { QrCode, X } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-500 hover:scale-110"
          >
            <QrCode className="w-8 h-8 text-emerald-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Scan QR Code
          </h3>
          <p className="text-gray-600 mb-6">
            Point your camera at the bottle QR code
          </p>

          <div
            className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-4 border-emerald-500 border-dashed"
          >
            <div className="animate-spin-slow">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all cursor-pointer font-semibold"
          >
            Start Camera
          </button>
        </div>
      </div>
    </div>
  );
}
