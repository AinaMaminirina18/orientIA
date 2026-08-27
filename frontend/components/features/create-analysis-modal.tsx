"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormations } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";

export interface CreateAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAnalysisModal({ isOpen, onClose }: CreateAnalysisModalProps) {
  const { formations } = useFormations();
  const { toast } = useToast();
  const [selectedFormation, setSelectedFormation] = useState(formations[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: "info",
      title: "Analyse d'adéquation simulée",
      description: "Le modèle a recalculé la compatibilité pédagogique.",
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tester l'adéquation d'une formation"
      description="Sélectionnez un parcours pour simuler l'analyse de correspondance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Formation ISPM à évaluer *"
          value={selectedFormation}
          onChange={(e) => setSelectedFormation(e.target.value)}
          options={formations.map((f) => ({ value: f.id, label: `${f.code} — ${f.title}` }))}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button type="submit" size="sm">
            Lancer la simulation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
