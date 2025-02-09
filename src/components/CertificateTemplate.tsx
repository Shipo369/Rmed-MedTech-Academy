import React, { useState, useRef } from 'react';
import { X, Download, Plus, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateTemplateProps {
  onClose: () => void;
}

interface ImageState {
  file: File | null;
  preview: string;
  scale: number;
}

interface TrainingModule {
  title: string;
  points: string[];
}

interface ImageUploadButtonProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onChange, label }) => (
  <label className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100">
    <input type="file" className="hidden" onChange={onChange} accept="image/*" />
    <Plus className="h-4 w-4 mr-1.5" />
    {label}
  </label>
);

export function CertificateTemplate({ onClose }: CertificateTemplateProps) {
  const [title, setTitle] = useState('Schulungszertifikat');
  const [referenceText, setReferenceText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [logo, setLogo] = useState<ImageState>({ file: null, preview: '', scale: 100 });
  const [signature, setSignature] = useState<ImageState>({ file: null, preview: '', scale: 100 });
  const [stamp, setStamp] = useState<ImageState>({ file: null, preview: '', scale: 100 });
  const [seal, setSeal] = useState<ImageState>({ file: null, preview: '', scale: 100 });
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([
    { title: 'Trainingsmodul 1', points: [''] }
  ]);
  const [orangeStripWidth, setOrangeStripWidth] = useState(20);

  // State for text sizes
  const [titleSize, setTitleSize] = useState(32);
  const [referenceTextSize, setReferenceTextSize] = useState(16);
  const [moduleTextSize, setModuleTextSize] = useState(14);
  const [bottomTextSize, setBottomTextSize] = useState(16);
  
  // State for logo position
  const [logoPosition, setLogoPosition] = useState({
    top: 20,
    right: 30,
    height: 25
  });

  const certificateRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          file,
          preview: reader.result as string,
          scale: 100
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModuleChange = (index: number, field: keyof TrainingModule, value: string | string[]) => {
    const newModules = [...trainingModules];
    if (field === 'title') {
      newModules[index].title = value as string;
    } else if (field === 'points') {
      newModules[index].points = value as string[];
    }
    setTrainingModules(newModules);
  };

  const handlePointChange = (moduleIndex: number, pointIndex: number, value: string) => {
    const newModules = [...trainingModules];
    newModules[moduleIndex].points[pointIndex] = value;
    setTrainingModules(newModules);
  };

  const addModule = () => {
    setTrainingModules([...trainingModules, { title: '', points: [''] }]);
  };

  const removeModule = (index: number) => {
    setTrainingModules(trainingModules.filter((_, i) => i !== index));
  };

  const addPoint = (moduleIndex: number) => {
    const newModules = [...trainingModules];
    newModules[moduleIndex].points.push('');
    setTrainingModules(newModules);
  };

  const removePoint = (moduleIndex: number, pointIndex: number) => {
    const newModules = [...trainingModules];
    newModules[moduleIndex].points = newModules[moduleIndex].points.filter(
      (_, i) => i !== pointIndex
    );
    setTrainingModules(newModules);
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );
      
      pdf.save('Zertifikat-Vorlage.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-auto p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Zertifikat-Vorlage bearbeiten</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Als PDF speichern
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Left Column - Settings */}
          <div className="space-y-8">
            {/* Text Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Texte</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Titel</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schriftgröße (pt)</label>
                    <input
                      type="number"
                      value={titleSize}
                      onChange={(e) => setTitleSize(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="8"
                      max="72"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referenztext</label>
                <div className="space-y-2">
                  <textarea
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schriftgröße (pt)</label>
                    <input
                      type="number"
                      value={referenceTextSize}
                      onChange={(e) => setReferenceTextSize(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="8"
                      max="72"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modultextgröße (pt)</label>
                <input
                  type="number"
                  value={moduleTextSize}
                  onChange={(e) => setModuleTextSize(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Text unten</label>
                <div className="space-y-2">
                  <textarea
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schriftgröße (pt)</label>
                    <input
                      type="number"
                      value={bottomTextSize}
                      onChange={(e) => setBottomTextSize(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="8"
                      max="72"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Training Modules */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Module</h3>
                <button
                  onClick={addModule}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Modul hinzufügen
                </button>
              </div>
              {trainingModules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      placeholder="Modultitel"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeModule(moduleIndex)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {module.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-center">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handlePointChange(moduleIndex, pointIndex, e.target.value)}
                          placeholder="Punkt hinzufügen"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removePoint(moduleIndex, pointIndex)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addPoint(moduleIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Punkt hinzufügen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Bilder</h3>
              
              {/* Company Logo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Firmenlogo</label>
                  <ImageUploadButton
                    onChange={(e) => handleImageUpload(e, setLogo)}
                    label="Logo hochladen"
                  />
                </div>
                {logo.preview && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Skalierung (%)</label>
                      <input
                        type="number"
                        value={logo.scale}
                        onChange={(e) => setLogo({ ...logo, scale: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">Abstand von oben (mm)</label>
                          <input
                            type="number"
                            value={logoPosition.top}
                            onChange={(e) => setLogoPosition({ ...logoPosition, top: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Abstand von rechts (mm)</label>
                          <input
                            type="number"
                            value={logoPosition.right}
                            onChange={(e) => setLogoPosition({ ...logoPosition, right: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Höhe (mm)</label>
                          <input
                            type="number"
                            value={logoPosition.height}
                            onChange={(e) => setLogoPosition({ ...logoPosition, height: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Unterschrift</label>
                  <ImageUploadButton
                    onChange={(e) => handleImageUpload(e, setSignature)}
                    label="Unterschrift hochladen"
                  />
                </div>
                {signature.preview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skalierung (%)</label>
                    <input
                      type="number"
                      value={signature.scale}
                      onChange={(e) => setSignature({ ...signature, scale: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Stamp */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Stempel</label>
                  <ImageUploadButton
                    onChange={(e) => handleImageUpload(e, setStamp)}
                    label="Stempel hochladen"
                  />
                </div>
                {stamp.preview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skalierung (%)</label>
                    <input
                      type="number"
                      value={stamp.scale}
                      onChange={(e) => setStamp({ ...stamp, scale: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Seal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Siegel</label>
                  <ImageUploadButton
                    onChange={(e) => handleImageUpload(e, setSeal)}
                    label="Siegel hochladen"
                  />
                </div>
                {seal.preview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skalierung (%)</label>
                    <input
                      type="number"
                      value={seal.scale}
                      onChange={(e) => setSeal({ ...seal, scale: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Orange Strip Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Breite des orangenen Streifens (mm)
              </label>
              <input
                type="number"
                value={orangeStripWidth}
                onChange={(e) => setOrangeStripWidth(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <div className="sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vorschau</h3>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <div
                  ref={certificateRef}
                  className="w-[210mm] h-[297mm] bg-white relative mx-auto"
                  style={{ transform: 'scale(0.4)', transformOrigin: 'top center' }}
                >
                  {/* Orange Strip */}
                  <div
                    className="absolute top-0 right-0 h-full bg-orange-500"
                    style={{ width: `${orangeStripWidth}mm` }}
                  />

                  {/* Company Logo */}
                  {logo.preview && (
                    <div className="absolute" style={{ 
                      top: `${logoPosition.top}mm`,
                      right: `${logoPosition.right}mm`
                    }}>
                      <img 
                        src={logo.preview}
                        alt="Company Logo" 
                        style={{ 
                          height: `${logoPosition.height}mm`,
                          transform: `scale(${logo.scale / 100})`,
                          transformOrigin: 'top right'
                        }}
                      />
                    </div>
                  )}

                  {/* Certificate Content */}
                  <div style={{ padding: '60mm 25mm 25mm 25mm' }} className="text-center">
                    <h1 className="font-serif text-gray-900 mb-8" style={{ fontSize: `${titleSize}pt` }}>
                      {title}
                    </h1>
                    <div 
                      className="whitespace-pre-line text-gray-800 mb-12"
                      style={{ fontSize: `${referenceTextSize}pt` }}
                    >
                      {referenceText}
                    </div>
                    
                    {/* Training Modules */}
                    <div className="text-left space-y-8 mb-12">
                      {trainingModules.map((module, index) => (
                        <div key={index}>
                          <h3 
                            className="font-medium text-gray-800 mb-4"
                            style={{ fontSize: `${moduleTextSize}pt` }}
                          >
                            {module.title}
                          </h3>
                          <ul className="list-disc pl-5 space-y-2">
                            {module.points.map((point, pointIndex) => (
                              <li 
                                key={pointIndex} 
                                className="text-gray-700"
                                style={{ fontSize: `${moduleTextSize}pt` }}
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Text */}
                    <div 
                      className="whitespace-pre-line text-gray-800 mb-12"
                      style={{ fontSize: `${bottomTextSize}pt` }}
                    >
                      {bottomText}
                    </div>

                    {/* Signatures Section */}
                    <div className="flex justify-between items-end px-12 mt-auto">
                      {/* Signature */}
                      <div className="text-center">
                        {signature.preview && (
                          <img
                            src={signature.preview}
                            alt="Signature"
                            className="mb-2"
                            style={{
                              height: '30mm',
                              transform: `scale(${signature.scale / 100})`,
                              transformOrigin: 'bottom center'
                            }}
                          />
                        )}
                        <div className="w-48 border-t border-gray-400">
                          <p className="text-sm text-gray-600 mt-1">Unterschrift</p>
                        </div>
                      </div>

                      {/* Stamp */}
                      <div className="text-center">
                        {stamp.preview && (
                          <img
                            src={stamp.preview}
                            alt="Stamp"
                            style={{
                              height: '40mm',
                              transform: `scale(${stamp.scale / 100})`,
                              transformOrigin: 'center'
                            }}
                          />
                        )}
                      </div>

                      {/* Seal */}
                      <div className="text-center">
                        {seal.preview && (
                          <img
                            src={seal.preview}
                            alt="Seal"
                            style={{
                              height: '40mm',
                              transform: `scale(${seal.scale / 100})`,
                              transformOrigin: 'center'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}