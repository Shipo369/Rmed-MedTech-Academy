import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Trash2, GraduationCap, Monitor, CheckCircle, ArrowLeft, Lock, FileText, FileEdit, LayoutDashboard, BookOpen, FolderOpen, ClipboardList, BarChart2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Training, DeviceType, Question, TestResult, DeviceDocument } from '../types';
import { TestInterface } from './TestInterface';
import { TestResults } from './TestResults';
import { DocumentUpload } from './DocumentUpload';
import { CertificateTemplate } from './CertificateTemplate';

interface TrainingSectionProps {
  isAdmin: boolean;
  username: string;
  userId: string;
}

interface TabButtonProps {
  tab: string;
  current: string;
  icon: React.ElementType;
  label: string;
}

function TabButton({ tab, current, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      className={`flex items-center space-x-2 py-4 px-2 border-b-2 ${
        current === tab
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

export function TrainingSection({ isAdmin, username, userId }: TrainingSectionProps) {
  const [trainings, setTrainings] = useState<Training[]>(() => {
    const stored = localStorage.getItem('trainings');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [showNewTrainingForm, setShowNewTrainingForm] = useState(false);
  const [showNewDeviceForm, setShowNewDeviceForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showCertificateTemplate, setShowCertificateTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const stored = localStorage.getItem('testResults');
    return stored ? JSON.parse(stored) : [];
  });

  // Training form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageScale, setImageScale] = useState(100);

  // Device form state
  const [deviceTitle, setDeviceTitle] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [deviceImageUrl, setDeviceImageUrl] = useState('');
  const [deviceImageScale, setDeviceImageScale] = useState(100);
  const [passingPercentage, setPassingPercentage] = useState(70);

  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single');
  const [options, setOptions] = useState<string[]>(['']);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

  const handleDocumentUpdate = (deviceId: string, doc: DeviceDocument) => {
    if (!selectedTraining) return;

    const updatedTrainings = trainings.map(training => ({
      ...training,
      deviceTypes: training.deviceTypes.map(device => 
        device.id === deviceId
          ? { ...device, documentation: doc }
          : device
      )
    }));

    saveToLocalStorage(updatedTrainings);
  };

  const saveToLocalStorage = (updatedTrainings: Training[]) => {
    localStorage.setItem('trainings', JSON.stringify(updatedTrainings));
    setTrainings(updatedTrainings);
  };

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const newTraining: Training = {
      id: crypto.randomUUID(),
      title,
      description,
      imageUrl,
      imageScale,
      deviceTypes: []
    };

    const updatedTrainings = [...trainings, newTraining];
    saveToLocalStorage(updatedTrainings);
    setShowNewTrainingForm(false);
    resetTrainingForm();
    toast.success('Schulung erfolgreich erstellt');
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraining) return;

    const newDevice: DeviceType = {
      id: crypto.randomUUID(),
      trainingId: selectedTraining.id,
      title: deviceTitle,
      description: deviceDescription,
      imageUrl: deviceImageUrl,
      imageScale: deviceImageScale,
      questions: [],
      passingPercentage
    };

    const updatedTrainings = trainings.map(training => {
      if (training.id === selectedTraining.id) {
        return {
          ...training,
          deviceTypes: [...training.deviceTypes, newDevice]
        };
      }
      return training;
    });

    saveToLocalStorage(updatedTrainings);
    setShowNewDeviceForm(false);
    resetDeviceForm();
    toast.success('Gerätetyp erfolgreich hinzugefügt');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || !selectedTraining) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: questionText,
      type: questionType,
      options: options.filter(option => option.trim() !== ''),
      correctAnswers
    };

    const updatedTrainings = trainings.map(training => {
      if (training.id === selectedTraining.id) {
        return {
          ...training,
          deviceTypes: training.deviceTypes.map(device => {
            if (device.id === selectedDevice.id) {
              return {
                ...device,
                questions: [...device.questions, newQuestion]
              };
            }
            return device;
          })
        };
      }
      return training;
    });

    saveToLocalStorage(updatedTrainings);
    setShowQuestionForm(false);
    resetQuestionForm();
    toast.success('Frage erfolgreich hinzugefügt');
  };

  const handleDeleteQuestion = (deviceId: string, questionId: string) => {
    if (!selectedTraining) return;

    const updatedTrainings = trainings.map(training => {
      if (training.id === selectedTraining.id) {
        return {
          ...training,
          deviceTypes: training.deviceTypes.map(device => {
            if (device.id === deviceId) {
              return {
                ...device,
                questions: device.questions.filter(q => q.id !== questionId)
              };
            }
            return device;
          })
        };
      }
      return training;
    });

    saveToLocalStorage(updatedTrainings);
    toast.success('Frage erfolgreich gelöscht');
  };

  const resetTrainingForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setImageScale(100);
  };

  const resetDeviceForm = () => {
    setDeviceTitle('');
    setDeviceDescription('');
    setDeviceImageUrl('');
    setDeviceImageScale(100);
    setPassingPercentage(70);
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionType('single');
    setOptions(['']);
    setCorrectAnswers([]);
  };

  const handleDeleteTraining = (trainingId: string) => {
    const updatedTrainings = trainings.filter(t => t.id !== trainingId);
    saveToLocalStorage(updatedTrainings);
    setSelectedTraining(null);
    toast.success('Schulung erfolgreich gelöscht');
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (!selectedTraining) return;
    
    const updatedTrainings = trainings.map(training => ({
      ...training,
      deviceTypes: training.deviceTypes.filter(d => d.id !== deviceId)
    }));
    saveToLocalStorage(updatedTrainings);
    setSelectedDevice(null);
    toast.success('Gerätetyp erfolgreich gelöscht');
  };

  const canTakeTest = (device: DeviceType) => {
    if (!device.questions.length) return false;
    
    const userResults = testResults.filter(
      result => result.userId === userId && result.deviceId === device.id
    );
    
    if (!userResults.length) return true;
    
    const latestResult = userResults.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return !latestResult.isLocked;
  };

  const handleStartTest = (device: DeviceType) => {
    if (isAdmin) {
      setSelectedDevice(device);
    } else if (canTakeTest(device)) {
      setSelectedDevice(device);
      setShowTest(true);
    } else {
      toast.error('Dieser Test ist gesperrt. Bitte wenden Sie sich an einen Administrator für eine Freischaltung.');
    }
  };

  const handleTestComplete = () => {
    const stored = localStorage.getItem('testResults');
    if (stored) {
      setTestResults(JSON.parse(stored));
    }
    setShowTest(false);
    setSelectedDevice(null);
    toast.success('Test wurde erfolgreich abgeschlossen und ist nun gesperrt');
  };

  const handleUnlockTest = (resultId: string) => {
    const updatedResults = testResults.map(result =>
      result.id === resultId ? { ...result, isLocked: false } : result
    );
    setTestResults(updatedResults);
    localStorage.setItem('testResults', JSON.stringify(updatedResults));
    toast.success('Test wurde für den Benutzer freigeschaltet');
  };

  const renderDeviceContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{selectedDevice?.description}</p>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Bestehensgrenze: {selectedDevice?.passingPercentage}%</span>
            </div>
          </div>
        );
      case 'documents':
        return (
          <DocumentUpload
            deviceId={selectedDevice?.id || ''}
            currentDoc={selectedDevice?.documentation}
            onDocumentUpdate={(doc) => handleDocumentUpdate(selectedDevice?.id || '', doc)}
            isAdmin={isAdmin}
            username={username}
            userId={userId}
          />
        );
      case 'tests':
        return (
          <div className="space-y-4">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Frage
                </button>
                <TestResults
                  results={testResults.filter(result => result.deviceId === selectedDevice?.id)}
                  onUnlock={handleUnlockTest}
                />
              </>
            ) : (
              <button
                onClick={() => setShowTest(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
                disabled={!canTakeTest(selectedDevice!)}
              >
                Test starten
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <GraduationCap className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Schulungsportal</h2>
            <p className="text-blue-100">Verwalten Sie Ihre Schulungen und Gerätetypen</p>
          </div>
        </div>
        {isAdmin && !selectedTraining && !showTest && (
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCertificateTemplate(true)}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Zertifikat-Vorlage
            </button>
            <button
              onClick={() => setShowNewTrainingForm(true)}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Schulung
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      {(selectedTraining || showTest) && (
        <button
          onClick={() => {
            if (showTest) {
              setShowTest(false);
              setSelectedDevice(null);
            } else {
              setSelectedTraining(null);
              setSelectedDevice(null);
            }
          }}
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zur Übersicht
        </button>
      )}

      {/* Zertifikat-Vorlage Modal */}
      {showCertificateTemplate && (
        <CertificateTemplate onClose={() => setShowCertificateTemplate(false)} />
      )}

      {/* Forms */}
      {showNewTrainingForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Schulung erstellen</h3>
          <form onSubmit={handleAddTraining} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bild-URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bildskalierung (%)</label>
              <input
                type="number"
                value={imageScale}
                onChange={(e) => setImageScale(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="200"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTrainingForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Schulung erstellen
              </button>
            </div>
          </form>
        </div>
      )}

      {showNewDeviceForm && selectedTraining && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Neuen Gerätetyp hinzufügen</h3>
          <form onSubmit={handleAddDevice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titel</label>
              <input
                type="text"
                value={deviceTitle}
                onChange={(e) => setDeviceTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                value={deviceDescription}
                onChange={(e) => setDeviceDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bild-URL</label>
              <input
                type="url"
                value={deviceImageUrl}
                onChange={(e) => setDeviceImageUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bildskalierung (%)</label>
              <input
                type="number"
                value={deviceImageScale}
                onChange={(e) => setDeviceImageScale(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bestehensgrenze (%)</label>
              <input
                type="number"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="100"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewDeviceForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Gerätetyp hinzufügen
              </button>
            </div>
          </form>
        </div>
      )}

      {showQuestionForm && selectedDevice && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Frage hinzufügen</h3>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frage</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fragetyp</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as 'single' | 'multiple')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="single">Einzelauswahl</option>
                <option value="multiple">Mehrfachauswahl</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Antwortoptionen</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space