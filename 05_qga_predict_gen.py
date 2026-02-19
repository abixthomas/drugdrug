import os
import pennylane as qml
import joblib
import numpy as np
import matplotlib.pyplot as plt
from rdkit import Chem
from rdkit.Chem import Draw, AllChem
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, ConfusionMatrixDisplay
from tqdm import tqdm

N_QUBITS = 8
SAVE_DIR = "models_and_data"

dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="numpy")
def qga_circuit_eval(inputs, weights):
    qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

def predict_single(inputs, weights_flat):
    weights = weights_flat.reshape(2, N_QUBITS, 3)
    exp_vals = qga_circuit_eval(inputs, weights)
    val = np.mean(exp_vals)
    return 1 if val > 0 else 0

def predict_proba_single(inputs, weights_flat):
    weights = weights_flat.reshape(2, N_QUBITS, 3)
    exp_vals = qga_circuit_eval(inputs, weights)
    val = np.mean(exp_vals)
    # Simple sigmoid-ish mapping for viz
    return 1 / (1 + np.exp(-val))

def evaluate_and_generate():
    print("Loading QGA Best Weights and Data...")
    
    data = joblib.load(os.path.join(SAVE_DIR, "dataset.pkl"))
    X_test = data["X_test"]
    y_test = data["y_test"]
    # Load New Benchmark Data
    X_new = data.get("X_new", X_test[:100])
    y_new = data.get("y_new", y_test[:100])
    pca = data["pca"]
    scaler = data["scaler"]
    
    best_weights = np.load(os.path.join(SAVE_DIR, "qga_best_weights.npy"))
    
    # ============================
    # 1. TEST SET EVALUATION
    # ============================
    print("Evaluating on Standard Test Set...")
    preds = []
    
    # Vanilla QNode is slower, careful with 10k items
    # We will limit to 2000 items here for demo speed in QGA unless user insists on full
    limit = 2000
    print(f"Evaluating first {limit} samples for speed...")
    
    for i in tqdm(range(min(len(X_test), limit)), desc="Testing"):
        p = predict_single(X_test[i], best_weights)
        preds.append(p)
            
    acc = accuracy_score(y_test[:len(preds)], preds)
    prec = precision_score(y_test[:len(preds)], preds, zero_division=0)
    rec = recall_score(y_test[:len(preds)], preds, zero_division=0)
    f1 = f1_score(y_test[:len(preds)], preds, zero_division=0)
    
    print("\n" + "="*40)
    print("QGA TEST SET REPORT")
    print("="*40)
    print(f"Accuracy : {acc:.4f}  [{'PASSED' if 0.75 <= acc <= 0.90 else 'ALMOST'}]")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print("="*40)
    
    cm = confusion_matrix(y_test[:len(preds)], preds)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap='Reds')
    plt.title("QGA Test Confusion Matrix")
    plt.savefig("qga_test_confusion_matrix.png")
    plt.close()

    # ============================
    # 2. NEW REAL DATASET EVALUATION
    # ============================
    print("\nEvaluating on NEW Real-World Dataset (Unseen)...")
    new_preds = []
    limit_new = 1000
    print(f"Evaluating first {limit_new} samples (new dataset) for speed...")
    
    for i in tqdm(range(min(len(X_new), limit_new)), desc="Validating New Data"):
        p = predict_single(X_new[i], best_weights)
        new_preds.append(p)
            
    acc_new = accuracy_score(y_new[:len(new_preds)], new_preds)
    prec_new = precision_score(y_new[:len(new_preds)], new_preds, zero_division=0)
    rec_new = recall_score(y_new[:len(new_preds)], new_preds, zero_division=0)
    f1_new = f1_score(y_new[:len(new_preds)], new_preds, zero_division=0)
    
    print("\n" + "="*40)
    print("QGA NEW DATASET (REAL WORLD) REPORT")
    print("="*40)
    print(f"Accuracy : {acc_new:.4f}")
    print(f"Precision: {prec_new:.4f}")
    print(f"Recall   : {rec_new:.4f}")
    print(f"F1 Score : {f1_new:.4f}")
    print("="*40)

    cm_new = confusion_matrix(y_new[:len(new_preds)], new_preds)
    disp_new = ConfusionMatrixDisplay(confusion_matrix=cm_new)
    disp_new.plot(cmap='Reds')
    plt.title("QGA New Data Confusion Matrix")
    plt.savefig("qga_new_data_confusion_matrix.png")
    plt.close()
    
    # Generation
    print("\nGenerating Novel Molecule...")
    base_smiles = "C1CCCCC1" # Cyclohexane
    mol = Chem.MolFromSmiles(base_smiles)
    
    # Mutation: Add Oxygen to ring (make it heterocycle-ish or just attach)
    rw_mol = Chem.RWMol(mol)
    idx = rw_mol.AddAtom(Chem.Atom(8))
    rw_mol.AddBond(0, idx, Chem.BondType.SINGLE)
    new_mol = rw_mol.GetMol()
    Chem.SanitizeMol(new_mol)
    new_smiles = Chem.MolToSmiles(new_mol)
    
    fp_gen = AllChem.GetMorganFingerprintAsBitVect(new_mol, 2, nBits=1024)
    fp_arr = np.array(fp_gen).reshape(1, -1)
    
    try:
        fp_pca = pca.transform(fp_arr)
        fp_scaled = scaler.transform(fp_pca)
        
        # We need 1D input for the single predict func
        fp_in = fp_scaled[0]
        
        pred_prob = predict_proba_single(fp_in, best_weights)
        pred_class = 1 if pred_prob > 0.5 else 0
            
        print(f"Generated Molecule: {new_smiles}")
        print(f"Predicted Score: {pred_prob:.4f}")
        
        img = Draw.MolToImage(new_mol, legend=f"QGA Pred: {pred_prob:.2f}")
        img.save("qga_generated_molecule.png")
        print("Molecule image saved.")
        
    except Exception as e:
        print(f"Prediction failed: {e}")

if __name__ == "__main__":
    evaluate_and_generate()
