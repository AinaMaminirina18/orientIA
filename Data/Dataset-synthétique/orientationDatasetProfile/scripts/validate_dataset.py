# -*- coding: utf-8 -*-
"""Contrôles de cohérence appliqués au dataset synthétique + rapport statistique."""
import json
from collections import Counter, defaultdict
import statistics as stats
from reference_parcours import PARCOURS

profiles = [json.loads(l) for l in open("../data/ispm_orientation_dataset.jsonl", encoding="utf-8")]

report = []
errors = []

def log(line):
    report.append(line)

# 1. Unicité des identifiants
ids = [p["profil_id"] for p in profiles]
if len(ids) != len(set(ids)):
    errors.append("Des profil_id sont dupliqués.")
log(f"1. Unicité des profil_id : OK ({len(set(ids))}/{len(ids)} uniques)" if len(ids) == len(set(ids)) else "1. ERREUR doublons d'ID")

# 2. Bornes des notes [0,20]
note_fields = [k for k in profiles[0] if k.startswith("note_")] + ["moyenne_generale"]
out_of_range = 0
for p in profiles:
    for f in note_fields:
        if not (0 <= p[f] <= 20):
            out_of_range += 1
log(f"2. Notes hors bornes [0,20] : {out_of_range} valeur(s)" + (" -> OK" if out_of_range == 0 else " -> ERREUR"))
if out_of_range:
    errors.append("Notes hors bornes détectées.")

# 3. Champs listes non vides
list_fields = ["matieres_preferees", "competences_declarees", "centres_interet",
               "activites_projets", "preferences_professionnelles"]
min_len = {"matieres_preferees": 2, "competences_declarees": 3, "centres_interet": 1,
           "activites_projets": 1, "preferences_professionnelles": 1}
empty_issues = 0
for p in profiles:
    for f in list_fields:
        if len(p[f]) < min_len[f]:
            empty_issues += 1
log(f"3. Champs listes trop courts / vides : {empty_issues}" + (" -> OK" if empty_issues == 0 else " -> ERREUR"))
if empty_issues:
    errors.append("Des champs listes sont vides ou incomplets.")

# 4. Série de bac dans un référentiel connu
bad_bac = sum(1 for p in profiles if p["serie_bac"] not in
              {"C", "D", "S", "A1", "A2", "L", "Technique", "OSE"})
log(f"4. Séries de bac hors référentiel connu : {bad_bac}" + (" -> OK" if bad_bac == 0 else " -> ERREUR"))
if bad_bac:
    errors.append("Séries de bac non reconnues détectées.")

# 5. Cohérence moyenne_generale vs notes détaillées
mismatch = 0
for p in profiles:
    vals = [p[f] for f in note_fields if f != "moyenne_generale"]
    computed = round(stats.mean(vals), 2)
    if abs(computed - p["moyenne_generale"]) > 0.05:
        mismatch += 1
log(f"5. Cohérence moyenne_generale recalculée vs stockée : {mismatch} écart(s)" + (" -> OK" if mismatch == 0 else " -> ERREUR"))
if mismatch:
    errors.append("Incohérence entre moyenne_generale et les notes détaillées.")

# 6. Distribution des parcours cibles (classes)
class_counts = Counter(p["parcours_recommande"] for p in profiles)
log("6. Distribution des parcours (classe cible) :")
for code, n in sorted(class_counts.items(), key=lambda x: -x[1]):
    log(f"   - {code} ({PARCOURS[code]['nom'][:40]}...): {n} ({100*n/len(profiles):.1f}%)")

# 7. Taux de profils ambigus
amb_rate = sum(p["profil_ambigu"] for p in profiles) / len(profiles)
log(f"7. Taux de profils ambigus (deux parcours plausibles) : {amb_rate*100:.1f}% (cible ~20%)")

# 8. Indépendance sexe / région vis-à-vis du parcours recommandé (contrôle anti-biais)
sex_by_class = defaultdict(Counter)
for p in profiles:
    sex_by_class[p["parcours_recommande"]][p["sexe"]] += 1
max_skew = 0
for code, counter in sex_by_class.items():
    total = sum(counter.values())
    female_ratio = counter.get("F", 0) / total
    max_skew = max(max_skew, abs(female_ratio - 0.5))
log(f"8. Contrôle anti-biais sexe/parcours : écart max à la parité = {max_skew*100:.1f} points"
    + (" -> OK (aléatoire, pas de corrélation injectée)" if max_skew < 0.12 else " -> À surveiller"))

# 9. Taux de bac 'hors famille' (réorientation / cas limites)
outfam = 0
for p in profiles:
    allowed = PARCOURS[p["parcours_recommande"]]["bac_series"]
    if p["serie_bac"] not in allowed:
        outfam += 1
log(f"9. Taux de séries de bac hors du référentiel attendu pour le parcours : {100*outfam/len(profiles):.1f}% (cible ~12%)")

# 10. Taux de profils 'généralistes' (notes plates, sans matière dominante nette)
# Reconstruit approximativement via l'écart-type des notes de chaque profil
flat_count = 0
for p in profiles:
    vals = [p[f] for f in note_fields if f != "moyenne_generale"]
    if stats.pstdev(vals) < 1.6:
        flat_count += 1
log(f"10. Profils à notes globalement plates (proxy 'généraliste') : {100*flat_count/len(profiles):.1f}%")

log("")
log("RÉSULTAT GLOBAL : " + ("AUCUNE ERREUR BLOQUANTE DÉTECTÉE" if not errors else f"{len(errors)} ERREUR(S) DÉTECTÉE(S)"))
for e in errors:
    log(" - " + e)

with open("../reports/dataset_validation_report.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(report))

print("\n".join(report))
