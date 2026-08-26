"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  RotateCcw,
  HardDrive,
  Download,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useEvaluation, useUserProfile, useFormations, useSources } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";

export default function SettingsPage() {
  const { resetAll } = useEvaluation();
  const { profile } = useUserProfile();
  const { formations } = useFormations();
  const { sources } = useSources();
  const { toast } = useToast();

  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleResetConfirm = () => {
    resetAll();
    toast({
      type: "success",
      title: "Données de démonstration réinitialisées",
      description: "Le profil candidat et les paramètres ORIENT'IA ont été restaurés.",
    });
    setIsResetOpen(false);
  };

  const handleExportJSON = () => {
    const data = {
      profile,
      formations,
      sources,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orientia_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: "info",
      title: "Sauvegarde exportée",
      description: "Le fichier JSON de configuration ORIENT'IA a été téléchargé.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Paramètres System & Stockage
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gestion de la persistance locale (`localStorage`), export des profils et règles éthiques.
        </p>
      </div>

      {/* Storage Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-600" />
            <CardTitle>Persistance Locale & Sauvegarde</CardTitle>
          </div>
          <CardDescription>
            ORIENT’IA conserve les données déclarées et les préférences sur votre navigateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-slate-500 block">Complétude Profil</span>
              <span className="text-lg font-bold text-emerald-700">{profile.completenessPercentage}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Formations Référencées</span>
              <span className="text-lg font-bold text-slate-900">{formations.length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Sources Documentaires</span>
              <span className="text-lg font-bold text-slate-900">{sources.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportJSON}
            >
              Exporter les données JSON
            </Button>
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={() => setIsResetOpen(true)}
            >
              Réinitialiser le profil démo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Architecture & AI Guardrails */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <CardTitle>Garde-fous & Éthique Algorithmique</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-medium">
            <strong>Mention Obligatoire :</strong> ORIENT’IA constitue un outil d’aide à l’orientation. Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique ni une décision officielle d’admission.
          </div>
          <p>
            <strong>Refus strict du profilage psychologique :</strong> Le système s'interdit toute déduction de personnalité et fonde ses prédictions uniquement sur les notes et compétences explicitement déclarées.
          </p>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetConfirm}
        title="Réinitialiser le profil candidat ?"
        description="Cette action va réinitialiser le profil et restaurer le jeu d'essai initial."
        confirmText="Réinitialiser"
      />
    </div>
  );
}
