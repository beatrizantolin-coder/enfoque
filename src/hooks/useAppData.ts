import { useCallback, useEffect, useState } from 'react';
import * as autostart from '@tauri-apps/plugin-autostart';
import * as db from '../lib/db';
import { todayISO } from '../lib/time';
import type { Client, Project, Rate, Rule, TimeEntry, TrackingMode } from '../lib/types';

export interface AppData {
  loading: boolean;
  projects: Project[];
  rules: Rule[];
  rates: Rate[];
  clients: Client[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  entries: TimeEntry[];
  todayEntries: TimeEntry[];
  mode: TrackingMode;
  launchAtLogin: boolean;

  createProject: (input: { id: string; name: string; color?: string }) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  replaceProjectRules: (projectId: string, keywords: string[]) => Promise<void>;

  createRule: (input: { id: string; keyword: string; projectId: string }) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;

  createEntry: (input: { id: string; projectId: string; app: string; date: string; start: string; end: string }) => Promise<void>;
  updateEntry: (id: string, patch: Partial<TimeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  createRate: (input: { id: string; role: string }) => Promise<void>;
  updateRate: (id: string, patch: Partial<Rate>) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;

  createClient: (input: { id: string; name: string; color?: string }) => Promise<void>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  setMode: (mode: TrackingMode) => Promise<void>;
  setLaunchAtLogin: (value: boolean) => Promise<void>;
}

const MODE_KEY = 'tracking_mode';
const LAUNCH_AT_LOGIN_KEY = 'launch_at_login';

export function useAppData(): AppData {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [mode, setModeState] = useState<TrackingMode>('automatico');
  const [launchAtLogin, setLaunchAtLoginState] = useState(true);

  const reloadEntries = useCallback(async (date: string) => {
    const rows = await db.listEntriesForDate(date);
    setEntries(rows);
    if (date === todayISO()) setTodayEntries(rows);
  }, []);

  const reloadTodayEntries = useCallback(async () => {
    const today = todayISO();
    const rows = await db.listEntriesForDate(today);
    setTodayEntries(rows);
    if (selectedDate === today) setEntries(rows);
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [projectRows, ruleRows, rateRows, clientRows, storedMode, storedLaunch] = await Promise.all([
        db.listProjects(),
        db.listRules(),
        db.listRates(),
        db.listClients(),
        db.getSetting(MODE_KEY),
        db.getSetting(LAUNCH_AT_LOGIN_KEY),
      ]);
      if (cancelled) return;
      setProjects(projectRows);
      setRules(ruleRows);
      setRates(rateRows);
      setClients(clientRows);
      if (storedMode === 'automatico' || storedMode === 'manual') setModeState(storedMode);
      // El plugin de autostart es la fuente de verdad real del sistema; el
      // valor en `settings` es solo un respaldo si el plugin no responde.
      try {
        setLaunchAtLoginState(await autostart.isEnabled());
      } catch {
        if (storedLaunch !== null) setLaunchAtLoginState(storedLaunch === 'true');
      }
      await reloadEntries(todayISO());
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // Solo al montar: las recargas puntuales se disparan desde cada mutación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reloadEntries(selectedDate);
  }, [selectedDate, reloadEntries]);

  const createProject: AppData['createProject'] = async (input) => {
    await db.createProject(input);
    setProjects(await db.listProjects());
  };
  const updateProject: AppData['updateProject'] = async (id, patch) => {
    await db.updateProject(id, patch);
    setProjects(await db.listProjects());
  };
  const deleteProject: AppData['deleteProject'] = async (id) => {
    await db.deleteProject(id);
    setProjects(await db.listProjects());
    setRules(await db.listRules());
    await reloadEntries(selectedDate);
    await reloadTodayEntries();
  };
  const replaceProjectRules: AppData['replaceProjectRules'] = async (projectId, keywords) => {
    await db.replaceProjectRules(projectId, keywords);
    setRules(await db.listRules());
  };

  const createRule: AppData['createRule'] = async (input) => {
    await db.createRule(input);
    setRules(await db.listRules());
  };
  const deleteRule: AppData['deleteRule'] = async (id) => {
    await db.deleteRule(id);
    setRules(await db.listRules());
  };

  const createEntry: AppData['createEntry'] = async (input) => {
    await db.createEntry(input);
    await reloadEntries(input.date);
    await reloadTodayEntries();
  };
  const updateEntry: AppData['updateEntry'] = async (id, patch) => {
    await db.updateEntry(id, patch);
    await reloadEntries(selectedDate);
    await reloadTodayEntries();
  };
  const deleteEntry: AppData['deleteEntry'] = async (id) => {
    await db.deleteEntry(id);
    await reloadEntries(selectedDate);
    await reloadTodayEntries();
  };

  const createRate: AppData['createRate'] = async (input) => {
    await db.createRate(input);
    setRates(await db.listRates());
  };
  const updateRate: AppData['updateRate'] = async (id, patch) => {
    await db.updateRate(id, patch);
    setRates(await db.listRates());
  };
  const deleteRate: AppData['deleteRate'] = async (id) => {
    await db.deleteRate(id);
    setRates(await db.listRates());
  };

  const createClient: AppData['createClient'] = async (input) => {
    await db.createClient(input);
    setClients(await db.listClients());
  };
  const updateClient: AppData['updateClient'] = async (id, patch) => {
    await db.updateClient(id, patch);
    setClients(await db.listClients());
  };
  const deleteClient: AppData['deleteClient'] = async (id) => {
    await db.deleteClient(id);
    setClients(await db.listClients());
  };

  const setMode: AppData['setMode'] = async (value) => {
    setModeState(value);
    await db.setSetting(MODE_KEY, value);
  };
  const setLaunchAtLogin: AppData['setLaunchAtLogin'] = async (value) => {
    setLaunchAtLoginState(value);
    try {
      await (value ? autostart.enable() : autostart.disable());
    } catch {
      // Entorno sin backend Tauri (p. ej. tests): el estado local ya se actualizó.
    }
    await db.setSetting(LAUNCH_AT_LOGIN_KEY, String(value));
  };

  return {
    loading,
    projects,
    rules,
    rates,
    clients,
    selectedDate,
    setSelectedDate,
    entries,
    todayEntries,
    mode,
    launchAtLogin,
    createProject,
    updateProject,
    deleteProject,
    replaceProjectRules,
    createRule,
    deleteRule,
    createEntry,
    updateEntry,
    deleteEntry,
    createRate,
    updateRate,
    deleteRate,
    createClient,
    updateClient,
    deleteClient,
    setMode,
    setLaunchAtLogin,
  };
}
