"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserProfile, useRecommendation } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { profile, updateProfile } = useUserProfile();
  const { recompute } = useRecommendation();
  const { toast } = useToast();

  const [name, setName] = useState(profile.name);
  const [currentLevel, setCurrentLevel] = useState(profile.currentLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, currentLevel });
    recompute();
    toast({
      type: "success",
      title: "Profil mis à jour",
      description: "Vos informations candidat ont été enregistrées.",
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Mise à jour rapide du Profil Candidat"
      description="Renseignez votre statut pour actualiser vos recommandations ORIENT'IA."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nom / Identifiant candidat *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Niveau d'études actuel"
          value={currentLevel}
          onChange={(e) => setCurrentLevel(e.target.value)}
          options={[
            { value: "Baccalauréat Scientifique", label: "Baccalauréat Scientifique / C" },
            { value: "Licence 1/2 Informatique", label: "Licence 1/2 Informatique" },
            { value: "Licence 3 Informatique", label: "Licence 3 Informatique validée" },
            { value: "Master 1 Scientifique", label: "Master 1 Scientifique / Ingéniorat" },
          ]}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
