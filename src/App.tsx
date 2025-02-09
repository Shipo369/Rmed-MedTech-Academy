import React, { useState, useEffect } from 'react';
import { Stethoscope, UserPlus, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { TrainingSection } from './components/TrainingSection';
import { LandingPage } from './components/LandingPage';
import { UserPermissions } from './components/UserPermissions';
import { User, Training } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [trainings, setTrainings] = useState<Training[]>(() => {
    const stored = localStorage.getItem('trainings');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (isLoggedIn) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'J.Jano' && password === '369369') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      toast.success('Erfolgreich als Administrator angemeldet');
      return;
    }

    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const user = users.find((u: User) => u.username === username && u.password === password);
      
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(false);
        toast.success('Erfolgreich angemeldet');
        return;
      }
    }

    toast.error('Ungültige Anmeldedaten');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    if (users.some(user => user.username === newUsername)) {
      toast.error('Benutzername existiert bereits');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username: newUsername,
      password: newPassword,
      permissions: {
        trainings: []
      }
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    toast.success('Benutzer erfolgreich erstellt');
    setNewUsername('');
    setNewPassword('');
    setEditingUserId(newUser.id);
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Benutzer erfolgreich gelöscht');
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpdatePermissions = (userId: string, permissions: User['permissions']) => {
    const updatedUsers = users.map(user => 
      user.id === userId
        ? { ...user, permissions }
        : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Berechtigungen erfolgreich aktualisiert');
    setEditingUserId(null);
  };

  if (!isLoggedIn && !showLoginForm) {
    return (
      <div>
        <LandingPage />
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowLoginForm(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
          >
            Anmelden
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Stethoscope className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Anmeldung
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Anmelden
              </button>
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Zurück zur Startseite
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isAdmin ? 'Administrator-Bereich' : 'Schulungsportal'}
                </h1>
                <p className="text-gray-600">
                  Willkommen, {username}!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsAdmin(false);
                    setUsername('');
                    setPassword('');
                    setUsers([]);
                    setNewUsername('');
                    setNewPassword('');
                    setShowPasswords({});
                    setShowLoginForm(false);
                    setEditingUserId(null);
                    toast.success('Erfolgreich abgemeldet');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </button>
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {isAdmin && (
              <div className="mb-8">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900">Benutzerverwaltung</h2>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Neuer Benutzername
                        </label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Neues Passwort
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Benutzer hinzufügen
                        </button>
                      </div>
                    </form>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Benutzername
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Passwort
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Aktionen
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <React.Fragment key={user.id}>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    {showPasswords[user.id] ? user.password : '••••••'}
                                    <button
                                      onClick={() => togglePasswordVisibility(user.id)}
                                      className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                      {showPasswords[user.id] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() => setEditingUserId(user.id)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      Berechtigungen
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {editingUserId === user.id && (
                                <tr>
                                  <td colSpan={3} className="px-6 py-4">
                                    <UserPermissions
                                      trainings={trainings}
                                      initialPermissions={user.permissions}
                                      onSave={(permissions) => handleUpdatePermissions(user.id, permissions)}
                                    />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TrainingSection
              isAdmin={isAdmin}
              username={username}
              userId={isAdmin ? 'admin' : users.find(u => u.username === username)?.id || ''}
            />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;