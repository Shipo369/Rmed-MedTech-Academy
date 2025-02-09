import React from 'react';
import { FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateProps {
  username: string;
  deviceTitle: string;
  trainingTitle: string;
  score: number;
  date: string;
  onClose: () => void;
}

export function Certificate({ username, deviceTitle, trainingTitle, score, date, onClose }: CertificateProps) {
  const handleDownload = async () => {
    const certificate = document.getElementById('certificate');
    if (!certificate) return;

    try {
      const canvas = await html2canvas(certificate, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Zertifikat-${username.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Schulungszertifikat</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Als PDF herunterladen
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>

        <div className="p-8">
          <div
            id="certificate"
            className="bg-white relative w-[210mm] h-[297mm] mx-auto p-16 shadow-lg"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #f0f9ff 0%, #ffffff 100%)',
              transform: 'scale(0.5)',
              transformOrigin: 'top center'
            }}
          >
            {/* Border Design */}
            <div className="absolute inset-0 border-[20px] border-double border-blue-100 m-8"></div>

            {/* Certificate Content */}
            <div className="relative h-full flex flex-col items-center justify-between text-center z-10">
              {/* Header */}
              <div className="pt-8">
                <h1 className="text-4xl font-serif text-blue-800 mb-4">Zertifikat</h1>
                <p className="text-xl text-gray-600">für erfolgreich absolvierte Schulung</p>
              </div>

              {/* Main Content */}
              <div className="max-w-2xl mx-auto space-y-8">
                <p className="text-2xl text-gray-800">
                  Hiermit wird bestätigt, dass
                </p>
                <p className="text-3xl font-semibold text-blue-900 py-4">
                  {username}
                </p>
                <p className="text-xl text-gray-800 leading-relaxed">
                  erfolgreich an der Schulung
                </p>
                <p className="text-2xl font-semibold text-blue-900 mb-4">
                  {trainingTitle}
                </p>
                <p className="text-xl text-gray-800">
                  für das Gerät
                </p>
                <p className="text-2xl font-semibold text-blue-900 mb-4">
                  {deviceTitle}
                </p>
                <p className="text-xl text-gray-800">
                  teilgenommen und mit {score.toFixed(1)}% bestanden hat.
                </p>
              </div>

              {/* Footer */}
              <div className="w-full pt-16">
                <div className="flex justify-between items-end px-12">
                  <div className="text-left">
                    <div className="w-64 border-t-2 border-gray-400 pt-2">
                      <p className="text-sm text-gray-600">Unterschrift Ausbilder</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4">
                      <div className="w-full h-full rounded-full border-4 border-blue-200 flex items-center justify-center">
                        <span className="text-blue-800 font-serif text-sm">SIEGEL</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-800 mb-2">{date}</p>
                    <div className="w-64 border-t-2 border-gray-400 pt-2">
                      <p className="text-sm text-gray-600">Datum der Ausstellung</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none"
              style={{ transform: 'rotate(-30deg)' }}
            >
              <p className="text-9xl font-serif text-black whitespace-nowrap">
                Reinhold Medizintechnik
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}