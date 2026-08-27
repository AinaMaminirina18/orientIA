"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSources } from "@/lib/useStore";
import { useToast } from "@/lib/useToast";

export interface CreateDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDatasetModal({ isOpen, onClose }: CreateDatasetModalProps) {
  const { sources } = useSources();
  const { toast } = useToast();
  const [docTitle, setDocTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: "success",
      title: "Document référencé",
      description: `Le document "${docTitle}" a été soumis pour indexation RAG.`,
    });
    setDocTitle("");
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Référencer une source RAG officelle"
      description="Soumettez une URL ou un document pédagogique ISPM."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Titre du document officiel *"
          placeholder="ex: Syllabus Master ISAIA 2026.pdf"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm">
            Soumettre
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
