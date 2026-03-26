"use client";
import { useState } from "react";

export default function PlayerCard({ stats, isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="flex justify-end mb-8">
        <div className="bg-black text-white rounded-2xl p-6 w-64 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="font-black text-sm">PLAYER CARD</p>
              <p className="text-xs text-white/70">Core visual</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>DISCIPLINA</span>
              <span>{stats?.disciplina || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${stats?.disciplina || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span>CONSISTENCIA</span>
              <span>{stats?.consistencia || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${stats?.consistencia || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span>ENFOQUE</span>
              <span>{stats?.enfoque || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${stats?.enfoque || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span>DEDICACIÓN</span>
              <span>{stats?.dedicacion || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${stats?.dedicacion || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span>CRECIMIENTO</span>
              <span>{stats?.crecimiento || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${stats?.crecimiento || 0}%` }}
              ></div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/20">
              <div className="flex justify-between font-bold">
                <span>TOTAL XP</span>
                <span>{stats?.total_xp || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
