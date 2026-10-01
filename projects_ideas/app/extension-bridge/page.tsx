'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ShieldCheck,
  Terminal,
  Play,
  Pause,
  RotateCw,
  Radio,
  FileCode,
  Download,
  CheckCircle,
  Copy,
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ExtensionBridgePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [videoFound, setVideoFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    addLog('[Bridge Console] Initializing window.postMessage diagnostics listener...');

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.channel === 'NOT_TOO_FAR_SYNC_BRIDGE_V1') {
        addLog(`[RECEIVED]: ${event.data.type} -> ${JSON.stringify(event.data.payload || {})}`);
        if (event.data.type === 'BRIDGE_READY' || event.data.type === 'BRIDGE_PONG') {
          setIsConnected(true);
          if (event.data.payload?.hasVideo) setVideoFound(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Send probe ping
    window.postMessage(
      {
        channel: 'NOT_TOO_FAR_SYNC_BRIDGE_V1',
        type: 'COMMAND_PING',
      },
      '*'
    );

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 35)]);
  };

  const sendTestCommand = (type: string, payload: any = {}) => {
    addLog(`[DISPATCH]: ${type} -> ${JSON.stringify(payload)}`);
    window.postMessage(
      {
        channel: 'NOT_TOO_FAR_SYNC_BRIDGE_V1',
        type,
        payload,
      },
      '*'
    );
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify({
      manifest_version: 3,
      name: "Not Too Far - Video Sync Companion",
      version: "1.0.0",
      permissions: ["activeTab", "scripting", "storage", "tabs"],
    }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-netflix-base text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 space-y-2">
          <div className="flex items-center space-x-2 text-netflix-red font-mono text-xs uppercase tracking-wider">
            <ExternalLink className="w-4 h-4" />
            <span>Teleparty Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Web Extension & Stream Bridge Companion
          </h1>
          <p className="text-xs sm:text-sm text-netflix-gray max-w-3xl">
            Synchronizes video playback across external media tabs (Netflix, Disney+ Hotstar, Amazon Prime Video, YouTube) via high-precision <code>window.postMessage</code> and background service worker relays.
          </p>
        </div>

        {/* Diagnostic Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-lg bg-netflix-surface border border-white/10 space-y-2">
            <span className="text-xs text-netflix-muted uppercase tracking-wider font-semibold">
              Bridge Protocol Status
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-base text-white">Active (v1.0.0)</span>
            </div>
            <p className="text-[11px] text-netflix-gray">
              Listening on channel <code>NOT_TOO_FAR_SYNC_BRIDGE_V1</code>
            </p>
          </div>

          <div className="p-5 rounded-lg bg-netflix-surface border border-white/10 space-y-2">
            <span className="text-xs text-netflix-muted uppercase tracking-wider font-semibold">
              Drift Drift Correction Target
            </span>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-netflix-red" />
              <span className="font-bold text-base text-white">&lt; 1.5s Realignment</span>
            </div>
            <p className="text-[11px] text-netflix-gray">
              Network RTT / 2 automatic forward compensation enabled.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-netflix-surface border border-white/10 space-y-2">
            <span className="text-xs text-netflix-muted uppercase tracking-wider font-semibold">
              Supported Providers
            </span>
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <span>Netflix</span> • <span>Hotstar</span> • <span>Prime</span> • <span>HTML5</span>
            </div>
            <p className="text-[11px] text-netflix-gray">
              Manifest V3 content scripts pre-configured in <code>/public/extension</code>.
            </p>
          </div>
        </div>

        {/* Live Interactive Test Rig & Log Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Rig */}
          <div className="p-6 rounded-xl bg-netflix-surface border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-netflix-red" />
                <h3 className="font-bold text-base text-white">Bridge Command Simulator</h3>
              </div>
              <span className="text-xs font-mono text-green-400">Ready</span>
            </div>

            <p className="text-xs text-netflix-gray leading-relaxed">
              Dispatch simulated playback control commands across the window bus. Connected streaming tabs or the local player will respond instantaneously.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => sendTestCommand('COMMAND_PLAY')}
                className="flex items-center justify-center space-x-2 p-3 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate PLAY</span>
              </button>

              <button
                onClick={() => sendTestCommand('COMMAND_PAUSE')}
                className="flex items-center justify-center space-x-2 p-3 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Simulate PAUSE</span>
              </button>

              <button
                onClick={() => sendTestCommand('COMMAND_SEEK', { targetTime: 45.0 })}
                className="flex items-center justify-center space-x-2 p-3 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
              >
                <RotateCw className="w-4 h-4" />
                <span>Seek to 00:45</span>
              </button>

              <button
                onClick={() => sendTestCommand('COMMAND_PING')}
                className="flex items-center justify-center space-x-2 p-3 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
              >
                <Radio className="w-4 h-4 text-netflix-red" />
                <span>Ping Bridge</span>
              </button>
            </div>

            {/* Extension Files Quick Reference */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Companion Extension Assets
              </h4>
              <div className="space-y-1.5 text-xs font-mono text-netflix-gray">
                <div className="flex items-center justify-between p-2 rounded bg-netflix-dark">
                  <span>/public/extension/manifest.json</span>
                  <span className="text-green-400">MV3 Ready</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-netflix-dark">
                  <span>/public/extension/content-script.js</span>
                  <span className="text-green-400">Video DOM Hook</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-netflix-dark">
                  <span>/public/extension/background.js</span>
                  <span className="text-green-400">Service Worker</span>
                </div>
              </div>
            </div>
          </div>

          {/* Realtime Event Log Console */}
          <div className="p-6 rounded-xl bg-netflix-surface border border-white/10 flex flex-col h-[460px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <h3 className="font-bold text-sm text-white">Realtime Telemetry Log</h3>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-netflix-muted hover:text-white"
              >
                Clear Log
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/80 rounded p-3 font-mono text-[11px] text-green-400 space-y-1.5 select-text border border-white/5">
              {logs.map((log, index) => (
                <div key={index} className="break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
