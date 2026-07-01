"use client";

import { useState, useEffect } from "react";
import { Cpu, ArrowRight } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { HubRequest, VerifyResponse, Step } from "../types";
import { useVerifyShipment } from "../hooks/useVerifyShipment";
import { StepIndicator } from "./StepIndicator";
import { ShipmentInfo } from "./ShipmentInfo";
import { PhotoUploader } from "./PhotoUploader";
import { VerificationLoading } from "./VerificationLoading";
import { VerificationResult } from "./VerificationResult";

interface VerificationPanelProps {
  order: HubRequest;
  onResolve: (id: number, res: "verified" | "rejected") => void;
}

export function VerificationPanel({ order, onResolve }: VerificationPanelProps) {
  const [step, setStep] = useState<Step>("capture");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  // تنظيف الـ Preview URL عند الإلغاء/تغيير الطلب
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // استدعاء الهوك المخصص للتحقق
  const verifyMutation = useVerifyShipment();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    e.target.value = "";
  };

  const handleRunAI = () => {
    if (!selectedFile) return;

    setStep("analyze");

    verifyMutation.mutate(
      { id: order.requestId, file: selectedFile },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep("result");
        },
        onError: (error) => {
          const responseData = error.response?.data as any;
          const isValidationResult = responseData && (responseData.status || responseData.message === "Quantity Mismatch Error!");

          if (isValidationResult) {
            setResult(responseData);
            setStep("result");
          } else {
            setStep("capture");
          }
        },
      }
    );
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStep("capture");
  };

  const handleResolve = (id: number, resultType: "verified" | "rejected") => {
    onResolve(id, resultType);
    reset();
  };

  return (
    <GlassCard className="p-6">
      <StepIndicator step={step} />

      <div className="mt-6">
        {step === "capture" && (
          <div className="mc-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipment Details */}
              <ShipmentInfo order={order} />

              {/* Photo Snap Uploader */}
              <PhotoUploader previewUrl={previewUrl} onFileSelect={handleFileSelect} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleRunAI}
                disabled={!selectedFile}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-md hover:opacity-95 transition-opacity"
              >
                <Cpu className="w-4 h-4" /> Run AI Verification <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === "analyze" && <VerificationLoading />}

        {step === "result" && result && (
          <VerificationResult
            result={result}
            orderId={order.requestId}
            onReset={reset}
            onResolve={handleResolve}
          />
        )}
      </div>
    </GlassCard>
  );
}
