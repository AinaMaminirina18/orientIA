import json
import os

class ISPMontology:
    def __init__(self, kb_path="./data/ontologie/data/full_kb.json"):
        self.kb_data = self._load_kb(kb_path)

    def _load_kb(self, path):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def get_relations_parcours(self, code_parcours: str):
        parcours_info = self.kb_data.get(code_parcours, {})
        return parcours_info

ontology = ISPMontology()