"use client";

import React, { useEffect, useState } from "react";
import { QrCode, X } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setShow(false);
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl transition-all duration-300 ${
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* زرار X يقفل المودال — مع دوران بسيط في الهوفر */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-transform duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* أيقونة QR بتدخل بسبرينج خفيف */}
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-pop">
            <QrCode className="w-8 h-8 text-emerald-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h3>
          <p className="text-gray-600 mb-6">Point your camera at the bottle QR code</p>

          {/* مربع تمثيلي للكاميرا — بيلمع بنبض */}
          <div className="animate-pulse-ring w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-4 border-emerald-500 border-dashed">
            {/* أيقونة QR بتلف لف مستمر */}
            <div className="animate-spin-med">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
          </div>

          {/* زرار تشغيل الكاميرا (ديكور في الديمو) */}
          <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] cursor-pointer">
            Start Camera
          </button>
        </div>
      </div>
    </div>
  );
}
