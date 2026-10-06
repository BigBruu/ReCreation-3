import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    inviteCode: '',
    adminPassword: ''
  });
  const { login, adminLogin, register, loading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        await adminLogin(formData.adminPassword);
        toast({ title: "Erfolg!", description: "Admin-Login erfolgreich" });
      } else if (isLogin) {
        await login(formData.username, formData.password);
        toast({ title: "Erfolg!", description: "Anmeldung erfolgreich" });
      } else {
        if (!formData.inviteCode.trim()) {
          toast({ title: "Fehler", description: "Einladungscode erforderlich", variant: "destructive" });
          return;
        }
        await register(formData.username, formData.email, formData.password, formData.inviteCode);
        toast({ title: "Erfolg!", description: "Registrierung erfolgreich - Raumhafen wird zugewiesen..." });
      }
      
      setTimeout(() => {
        navigate(isAdmin ? '/admin' : '/game', { replace: true });
      }, 1500);
    } catch (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 starfield" testID="login-screen-container" data-testid="login-screen-container">
      <div className="bg-gray-900 p-8 rounded-lg border border-blue-500 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">TheReCreation</h1>
          <p className="text-gray-400">Authentisches Browser-Strategiespiel</p>
          <p className="text-xs text-gray-500 mt-2">47x47 Universum • Einladung erforderlich • Runde 10</p>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => { setIsAdminMode(false); setIsLogin(true); }}
            className={`flex-1 py-2 px-3 rounded text-sm ${!isAdmin ? 'bg-blue-600' : 'bg-gray-700'}`}
            testID="toggle-player-mode-btn"
            data-testid="toggle-player-mode-btn"
          >
            Spieler
          </button>
          <button
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-2 px-3 rounded text-sm ${isAdmin ? 'bg-red-600' : 'bg-gray-700'}`}
            testID="toggle-admin-mode-btn"
            data-testid="toggle-admin-mode-btn"
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isAdmin ? (
            <div>
              <label htmlFor="admin-password-input" className="block text-sm font-medium mb-1">Admin-Passwort</label>
              <input
                id="admin-password-input"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                placeholder="Admin-Passwort eingeben"
                testID="admin-password-input"
                data-testid="admin-password-input"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="player-username-input" className="block text-sm font-medium mb-1">Spielername</label>
                <input
                  id="player-username-input"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                  placeholder="Spielername eingeben"
                  testID="player-username-input"
                  data-testid="player-username-input"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="player-email-input" className="block text-sm font-medium mb-1">E-Mail</label>
                  <input
                    id="player-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                    placeholder="E-Mail eingeben"
                    testID="player-email-input"
                    data-testid="player-email-input"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="player-password-input" className="block text-sm font-medium mb-1">Passwort</label>
                <input
                  id="player-password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                  placeholder="Passwort eingeben"
                  testID="player-password-input"
                  data-testid="player-password-input"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="player-invite-input" className="block text-sm font-medium mb-1">Einladungscode *</label>
                  <input
                    id="player-invite-input"
                    type="text"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-400 focus:outline-none"
                    placeholder="8-stelliger Code"
                    maxLength="8"
                    testID="player-invite-input"
                    data-testid="player-invite-input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Erforderlich für Registrierung</p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 rounded font-medium transition-colors"
            testID="login-submit-btn"
            data-testid="login-submit-btn"
          >
            {loading ? 'Lade...' : (isAdmin ? 'Admin-Login' : (isLogin ? 'Anmelden' : 'Registrieren'))}
          </button>
        </form>

        {!isAdmin && (
          <div className="text-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm"
              testID="toggle-register-btn"
              data-testid="toggle-register-btn"
            >
              {isLogin ? 'Kein Account? Registrieren' : 'Bereits Account? Anmelden'}
            </button>
          </div>
        )}

        <div className="text-center mt-4 text-xs text-gray-500">
          <p>🔒 Geschlossenes Spiel - Nur mit Einladung</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
