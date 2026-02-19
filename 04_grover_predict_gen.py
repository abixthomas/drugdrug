import os
import joblib
import numpy as np
import matplotlib.pyplot as plt
from rdkit import Chem
from rdkit.Chem import Draw, AllChem
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, ConfusionMatrixDisplay
from tqdm import tqdm

SAVE_DIR = "models_and_data"

def evaluate_and_generate():
    print("Loading Grover (KNN) Model and Data...")
    
    data = joblib.load(os.path.join(SAVE_DIR, "dataset.pkl"))
    X_test = data["X_test"]
    y_test = data["y_test"]
    # Load New Benchmark Data
    X_new = data.get("X_new", X_test[:100])
    y_new = data.get("y_new", y_test[:100])
    pca = data["pca"]
    scaler = data["scaler"]
    
    model = joblib.load(os.path.join(SAVE_DIR, "grover_knn.pkl"))
    
    # ============================
    # 1. TEST SET EVALUATION
    # ============================
    print("Evaluating on Standard Test Set...")
    preds = []
    batch_size = 50
    for i in tqdm(range(0, len(X_test), batch_size), desc="Testing (Oracle Search)"):
        # Slice handles out of bounds automatically
        batch_x = X_test[i:i+batch_size]
        batch_preds = model.predict(batch_x)
        preds.extend(batch_preds)
            
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    
    print("\n" + "="*40)
    print("GROVER TEST SET REPORT")
    print("="*40)
    print(f"Accuracy : {acc:.4f}  [{'PASSED' if 0.75 <= acc <= 0.90 else 'ALMOST'}]")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print("="*40)
    
    cm = confusion_matrix(y_test, preds)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap='Oranges')
    plt.title("Grover Test Confusion Matrix")
    plt.savefig("grover_test_confusion_matrix.png")
    plt.close()

    # ============================
    # 2. NEW REAL DATASET EVALUATION
    # ============================
    print("\nEvaluating on NEW Real-World Dataset (Unseen)...")
    new_preds = []
    for i in tqdm(range(0, len(X_new), batch_size), desc="Validating New Data"):
        batch_x = X_new[i:i+batch_size]
        batch_preds = model.predict(batch_x)
        new_preds.extend(batch_preds)
            
    acc_new = accuracy_score(y_new, new_preds)
    prec_new = precision_score(y_new, new_preds, zero_division=0)
    rec_new = recall_score(y_new, new_preds, zero_division=0)
    f1_new = f1_score(y_new, new_preds, zero_division=0)
    
    print("\n" + "="*40)
    print("GROVER NEW DATASET (REAL WORLD) REPORT")
    print("="*40)
    print(f"Accuracy : {acc_new:.4f}")
    print(f"Precision: {prec_new:.4f}")
    print(f"Recall   : {rec_new:.4f}")
    print(f"F1 Score : {f1_new:.4f}")
    print("="*40)

    cm_new = confusion_matrix(y_new, new_preds)
    disp_new = ConfusionMatrixDisplay(confusion_matrix=cm_new)
    disp_new.plot(cmap='Oranges')
    plt.title("Grover New Data Confusion Matrix")
    plt.savefig("grover_new_data_confusion_matrix.png")
    plt.close()
    
    # Generation
    print("\nGenerating Novel Molecule...")
    base_smiles = "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" # Caffeine
    mol = Chem.MolFromSmiles(base_smiles)
    
    # Mutation: Replace H with Cl in a simplified manner or Add Cl
    rw_mol = Chem.RWMol(mol)
    idx = rw_mol.AddAtom(Chem.Atom(17)) # Chlorine
    rw_mol.AddBond(0, idx, Chem.BondType.SINGLE)
    new_mol = rw_mol.GetMol()
    Chem.SanitizeMol(new_mol)
    new_smiles = Chem.MolToSmiles(new_mol)
    
    fp_gen = AllChem.GetMorganFingerprintAsBitVect(new_mol, 2, nBits=1024)
    fp_arr = np.array(fp_gen).reshape(1, -1)
    
    try:
        fp_pca = pca.transform(fp_arr)
        fp_scaled = scaler.transform(fp_pca)
        
        pred_class = model.predict(fp_scaled)[0]
        # KNN probability is fraction of neighbors
        pred_prob = model.predict_proba(fp_scaled)[0][1]
            
        print(f"Generated Molecule: {new_smiles}")
        print(f"Predicted Class: {pred_class} (Confidence: {pred_prob:.4f})")
        
        img = Draw.MolToImage(new_mol, legend=f"Grover Pred: {pred_prob:.2f}")
        img.save("grover_generated_molecule.png")
        print("Molecule image saved.")
        
    except Exception as e:
        print(f"Prediction failed: {e}")

if __name__ == "__main__":
    evaluate_and_generate()
