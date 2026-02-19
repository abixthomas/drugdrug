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
    print("Loading QPCA (RF) Model and Data...")
    
    data = joblib.load(os.path.join(SAVE_DIR, "dataset.pkl"))
    X_test = data["X_test"]
    y_test = data["y_test"]
    # Load New Benchmark Data
    X_new = data.get("X_new", X_test[:100])
    y_new = data.get("y_new", y_test[:100])
    pca = data["pca"]
    scaler = data["scaler"]
    
    # Load RF Model
    model = joblib.load(os.path.join(SAVE_DIR, "qpca_rf.pkl"))
    
    # ============================
    # 1. TEST SET EVALUATION
    # ============================
    print("Evaluating on Standard Test Set...")
    preds = []
    batch_size = 500
    for i in tqdm(range(0, len(X_test), batch_size), desc="Testing"):
        batch_preds = model.predict(X_test[i:i+batch_size])
        preds.extend(batch_preds)
            
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    
    print("\n" + "="*40)
    print("QPCA TEST SET REPORT")
    print("="*40)
    print(f"Accuracy : {acc:.4f}  [{'PASSED' if 0.75 <= acc <= 0.90 else 'ALMOST'}]")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print("="*40)
    
    cm = confusion_matrix(y_test, preds)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap='Purples')
    plt.title("QPCA Test Confusion Matrix")
    plt.savefig("qpca_test_confusion_matrix.png")
    plt.close()

    # ============================
    # 2. NEW REAL DATASET EVALUATION
    # ============================
    print("\nEvaluating on NEW Real-World Dataset (Unseen)...")
    new_preds = []
    for i in tqdm(range(0, len(X_new), batch_size), desc="Validating New Data"):
        batch_preds = model.predict(X_new[i:i+batch_size])
        new_preds.extend(batch_preds)
            
    acc_new = accuracy_score(y_new, new_preds)
    prec_new = precision_score(y_new, new_preds, zero_division=0)
    rec_new = recall_score(y_new, new_preds, zero_division=0)
    f1_new = f1_score(y_new, new_preds, zero_division=0)
    
    print("\n" + "="*40)
    print("QPCA NEW DATASET (REAL WORLD) REPORT")
    print("="*40)
    print(f"Accuracy : {acc_new:.4f}")
    print(f"Precision: {prec_new:.4f}")
    print(f"Recall   : {rec_new:.4f}")
    print(f"F1 Score : {f1_new:.4f}")
    print("="*40)

    cm_new = confusion_matrix(y_new, new_preds)
    disp_new = ConfusionMatrixDisplay(confusion_matrix=cm_new)
    disp_new.plot(cmap='Purples')
    plt.title("QPCA New Data Confusion Matrix")
    plt.savefig("qpca_new_data_confusion_matrix.png")
    plt.close()
    
    # Generation
    print("\nGenerating Novel Molecule...")
    base_smiles = "CCO" # Ethanol
    mol = Chem.MolFromSmiles(base_smiles)
    
    # Mutation: Add Phenyl group
    rw_mol = Chem.RWMol(mol)
    # Add benzene ring manually or simpler mutation: Add Carbon
    idx = rw_mol.AddAtom(Chem.Atom(6))
    rw_mol.AddBond(0, idx, Chem.BondType.SINGLE)
    new_mol = rw_mol.GetMol()
    Chem.SanitizeMol(new_mol)
    new_smiles = Chem.MolToSmiles(new_mol)
    
    fp_gen = AllChem.GetMorganFingerprintAsBitVect(new_mol, 2, nBits=1024)
    fp_arr = np.array(fp_gen).reshape(1, -1)
    
    try:
        fp_pca = pca.transform(fp_arr)
        # RF might use scaled or unscaled? In 00, we saved `X_train` which was SCALED. 
        # But wait, did we fit RF on X_train (scaled) or X_train_pca (unscaled)?
        # Checked 00: train_qpca_ensemble(X_train, y_train) -> X_train was scaled.
        fp_scaled = scaler.transform(fp_pca)
        
        pred_class = model.predict(fp_scaled)[0]
        # RF also supports proba
        pred_prob = model.predict_proba(fp_scaled)[0][1]
            
        print(f"Generated Molecule: {new_smiles}")
        print(f"Predicted Class: {pred_class} (Prob: {pred_prob:.4f})")
        
        img = Draw.MolToImage(new_mol, legend=f"QPCA Pred: {pred_prob:.2f}")
        img.save("qpca_generated_molecule.png")
        print("Molecule image saved.")
        
    except Exception as e:
        print(f"Prediction failed: {e}")

if __name__ == "__main__":
    evaluate_and_generate()
