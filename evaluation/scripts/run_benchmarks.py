import json
import requests
import time
import os
from datetime import datetime

# Configuration
TEST_CASES_PATH = "../benchmarks/test_cases.json"
RESULTS_PATH = "../results/benchmark_report.json"
API_URL = "http://localhost:8000/chat"  # URL du backend FastAPI

def run_benchmarks():
    if not os.path.exists(TEST_CASES_PATH):
        print(f"Error: {TEST_CASES_PATH} not found.")
        return

    with open(TEST_CASES_PATH, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    results = []
    total_latency = 0
    passed_count = 0

    print(f"Lancement du benchmark ORIENT'IA ({len(test_cases)} cas)...")

    for tc in test_cases:
        print(f"Running {tc['id']} [{tc['category']}]...", end=" ", flush=True)
        
        start_time = time.time()
        status = "failed"
        answer = ""
        
        try:
            # Préparation du payload selon le type de test
            payload = {
                "message": tc.get("input", ""),
                "profil_candidat": tc.get("profile", None),
                "top_k": 5
            }
            
            # Appel API (simulation si API éteinte pour le script de démo)
            try:
                response = requests.post(API_URL, json=payload, timeout=10)
                if response.status_code == 200:
                    answer = response.json().get("answer", "")
                else:
                    answer = f"Error {response.status_code}"
            except:
                answer = "Simulated response for test " + tc["id"] # Fallback simulation

            latency = int((time.time() - start_time) * 1000)
            total_latency += latency

            # Vérification basique (contient les mots clés attendus)
            expected = tc.get("expected_output_contains", [])
            if not expected and "expected_recommendation" in tc:
                expected = [tc["expected_recommendation"]]
            
            if any(word.lower() in answer.lower() for word in expected):
                status = "passed"
                passed_count += 1
            
            results.append({
                "id": tc["id"],
                "category": tc["category"],
                "input": tc.get("input", ""),
                "output": answer,
                "status": status,
                "latency_ms": latency
            })
            print(f"[{status.upper()}] ({latency}ms)")

        except Exception as e:
            print(f"[ERROR] {str(e)}")

    # Rapport Final
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": len(test_cases),
            "passed": passed_count,
            "accuracy": round((passed_count / len(test_cases)) * 100, 2),
            "avg_latency_ms": round(total_latency / len(test_cases), 2)
        },
        "details": results
    }

    os.makedirs(os.path.dirname(RESULTS_PATH), exist_ok=True)
    with open(RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Benchmark terminé. Rapport généré dans {RESULTS_PATH}")
    print(f"Accuracy: {report['summary']['accuracy']}% | Latence Moyenne: {report['summary']['avg_latency_ms']}ms")

if __name__ == "__main__":
    run_benchmarks()
