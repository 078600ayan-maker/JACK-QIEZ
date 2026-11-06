'use client';

import React, { useEffect, useState } from 'react';
import { Manifest, SubjectMeta } from '@/types/manifest';
import { PathHUD } from '@/components/path/PathHUD';
import { WindingPath } from '@/components/path/WindingPath';
import { useUserStore } from '@/store/useUserStore';

export default function PathPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const activeSubjectId = useUserStore(s => s.activeSubjectId);

  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch('/data/manifest.json');
        if (res.ok) {
          const data: Manifest = await res.json();
          setManifest(data);
        }
      } catch (err) {
        console.error('Failed to load manifest.json', err);
      } finally {
        setLoading(false);
      }
    }

    loadManifest();
  }, []);

  if (loading || !manifest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-bold text-slate-400">Loading Royal Path...</span>
      </div>
    );
  }

  const currentSubject = manifest.subjects.find(s => s.id === activeSubjectId) || manifest.subjects[0];

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Floating Top Glass HUD Pill */}
      <PathHUD subjects={manifest.subjects} />

      {/* 5-Subject Winding S-Curve Path */}
      <WindingPath
        chapters={currentSubject.chapters}
        subjectId={currentSubject.id}
      />
    </div>
  );
}
