import React, { useState, useEffect } from 'react';
import { Training, User } from '../types';
import { Calendar, Monitor } from 'lucide-react';

interface UserPermissionsProps {
  initialPermissions?: User['permissions'];
  onSave: (permissions: User['permissions']) => void;
}

export function UserPermissions({ onSave, initialPermissions }: UserPermissionsProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTrainings, setSelectedTrainings] = useState<{
    [key: string]: {
      selected: boolean;
      validFrom: string;
      validUntil: string;
      deviceTypes: string[];
    };
  }>({});

  // Lade die Trainings aus dem localStorage
  useEffect(() => {
    const storedTrainings = localStorage.getItem('trainings');
    if (storedTrainings) {
      const parsedTrainings = JSON.parse(storedTrainings);
      setTrainings(parsedTrainings);
      
      // Initialisiere die Berechtigungen
      const permissions: { [key: string]: any } = {};
      parsedTrainings.forEach((training: Training) => {
        const existingPermission = initialPermissions?.trainings.find(t => t.id === training.id);
        permissions[training.id] = {
          selected: !!existingPermission,
          validFrom: existingPermission?.validFrom || new Date().toISOString().split('T')[0],
          validUntil: existingPermission?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deviceTypes: existingPermission?.deviceTypes || []
        };
      });
      setSelectedTrainings(permissions);
    }
  }, [initialPermissions]); // Aktualisiere wenn sich die initialPermissions ändern

  const handleSave = () => {
    const permissions: User['permissions'] = {
      trainings: Object.entries(selectedTrainings)
        .filter(([_, value]) => value.selected)
        .map(([id, value]) => ({
          id,
          validFrom: value.validFrom,
          validUntil: value.validUntil,
          deviceTypes: value.deviceTypes
        }))
    };
    onSave(permissions);
  };

  const handleDeviceTypeToggle = (trainingId: string, deviceTypeId: string) => {
    setSelectedTrainings(prev => ({
      ...prev,
      [trainingId]: {
        ...prev[trainingId],
        deviceTypes: prev[trainingId].deviceTypes.includes(deviceTypeId)
          ? prev[trainingId].deviceTypes.filter(id => id !== deviceTypeId)
          : [...prev[trainingId].deviceTypes, deviceTypeId]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Berechtigungen verwalten</h3>
      
      <div className="space-y-4">
        {trainings.map(training => (
          <div key={training.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTrainings[training.id]?.selected}
                  onChange={(e) => {
                    setSelectedTrainings(prev => ({
                      ...prev,
                      [training.id]: {
                        ...prev[training.id],
                        selected: e.target.checked
                      }
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{training.title}</h4>
                  <p className="text-sm text-gray-500">{training.description}</p>
                </div>
              </div>
            </div>

            {selectedTrainings[training.id]?.selected && (
              <div className="mt-4 pl-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gültig von</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={selectedTrainings[training.id].validFrom}
                        onChange={(e) => {
                          setSelectedTrainings(prev => ({
                            ...prev,
                            [training.id]: {
                              ...prev[training.id],
                              validFrom: e.target.value
                            }
                          }));
                        }}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gültig bis</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={selectedTrainings[training.id].validUntil}
                        onChange={(e) => {
                          setSelectedTrainings(prev => ({
                            ...prev,
                            [training.id]: {
                              ...prev[training.id],
                              validUntil: e.target.value
                            }
                          }));
                        }}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verfügbare Gerätetypen
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {training.deviceTypes.map(device => (
                      <label key={device.id} className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedTrainings[training.id].deviceTypes.includes(device.id)}
                            onChange={() => handleDeviceTypeToggle(training.id, device.id)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <span className="font-medium text-gray-700">{device.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Berechtigungen speichern
        </button>
      </div>
    </div>
  );
}