import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear?.();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#1A1A2E"
          canvasProps={{
            className: 'w-full h-48 cursor-crosshair',
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
          Clear Signature
        </button>
        <button
          type="button"
          onClick={save}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all"
        >
          <CheckCircle2 size={14} />
          Adopt & Sign
        </button>
      </div>
    </div>
  );
}
