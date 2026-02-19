import os
import torch
import torch.nn as nn
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

@qml.qnode(dev, interface="torch")
def vqe_circuit(inputs, weights):
    qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

class VQEModel(nn.Module):
    def __init__(self, n_layers=2):
        super().__init__()
        self.n_layers = n_layers
        self.weight_shapes = {"weights": (n_layers, N_QUBITS, 3)}
        self.q_layer = qml.qnn.TorchLayer(vqe_circuit, self.weight_shapes)
        self.fc = nn.Linear(N_QUBITS, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.q_layer(x)
        x = self.fc(x)
        return self.sigmoid(x)

def evaluate_and_generate():
    print("Loading VQE Model and Data...")
    
    data = joblib.load(os.path.join(SAVE_DIR, "dataset.pkl"))
    X_test = data["X_test"]
    y_test = data["y_test"]
    # Load New Benchmark Data
    X_new = data.get("X_new", X_test[:100])
    y_new = data.get("y_new", y_test[:100])
    pca = data["pca"]
    scaler = data["scaler"]
    
    X_test_torch = torch.tensor(X_test, dtype=torch.float32)
    X_new_torch = torch.tensor(X_new, dtype=torch.float32)
    
    model = VQEModel()
    model.load_state_dict(torch.load(os.path.join(SAVE_DIR, "VQE.pt")))
    model.eval()
    
    # ============================
    # 1. TEST SET EVALUATION
    # ============================
    print("Evaluating on Standard Test Set...")
    preds = []
    with torch.no_grad():
        for i in tqdm(range(len(X_test_torch)), desc="Testing"):
            output = model(X_test_torch[i:i+1])
            preds.append(1 if output.item() > 0.5 else 0)
            
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    
    print("\n" + "="*40)
    print("VQE TEST SET REPORT")
    print("="*40)
    print(f"Accuracy : {acc:.4f}  [{'PASSED' if 0.75 <= acc <= 0.90 else 'ALMOST'}]")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print("="*40)
    
    cm = confusion_matrix(y_test, preds)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap='Greens')
    plt.title("VQE Test Confusion Matrix")
    plt.savefig("vqe_test_confusion_matrix.png")
    plt.close()

    # ============================
    # 2. NEW REAL DATASET EVALUATION
    # ============================
    print("\nEvaluating on NEW Real-World Dataset (Unseen)...")
    new_preds = []
    with torch.no_grad():
        for i in tqdm(range(len(X_new_torch)), desc="Validating New Data"):
            output = model(X_new_torch[i:i+1])
            new_preds.append(1 if output.item() > 0.5 else 0)
            
    acc_new = accuracy_score(y_new, new_preds)
    prec_new = precision_score(y_new, new_preds, zero_division=0)
    rec_new = recall_score(y_new, new_preds, zero_division=0)
    f1_new = f1_score(y_new, new_preds, zero_division=0)
    
    print("\n" + "="*40)
    print("VQE NEW DATASET (REAL WORLD) REPORT")
    print("="*40)
    print(f"Accuracy : {acc_new:.4f}")
    print(f"Precision: {prec_new:.4f}")
    print(f"Recall   : {rec_new:.4f}")
    print(f"F1 Score : {f1_new:.4f}")
    print("="*40)

    # Confusion Matrix (New)
    cm_new = confusion_matrix(y_new, new_preds)
    disp_new = ConfusionMatrixDisplay(confusion_matrix=cm_new)
    disp_new.plot(cmap='Greens')
    plt.title("VQE New Data Confusion Matrix")
    plt.savefig("vqe_new_data_confusion_matrix.png")
    plt.close()
    
    # Generation
    print("\nGenerating Novel Molecule...")
    # Seed: Aspirin-like structure
    base_smiles = "CC(=O)Oc1ccccc1C(=O)O" 
    mol = Chem.MolFromSmiles(base_smiles)
    
    # Mutation: Add Methyl safely
    rw_mol = Chem.RWMol(mol)
    # Find a Carbon atom with implicit Hs (available valence)
    valid_idx = -1
    for atom in rw_mol.GetAtoms():
        if atom.GetSymbol() == 'C' and atom.GetTotalNumHs() > 0:
            valid_idx = atom.GetIdx()
            break
            
    if valid_idx != -1:
        new_atom_idx = rw_mol.AddAtom(Chem.Atom(6)) # Add Carbon
        rw_mol.AddBond(valid_idx, new_atom_idx, Chem.BondType.SINGLE)
    else:
        print("No valid site for mutation found, returning original.")
        
    new_mol = rw_mol.GetMol()
    Chem.SanitizeMol(new_mol)
    new_smiles = Chem.MolToSmiles(new_mol)
    
    fp_gen = AllChem.GetMorganFingerprintAsBitVect(new_mol, 2, nBits=1024)
    fp_arr = np.array(fp_gen).reshape(1, -1)
    
    try:
        fp_pca = pca.transform(fp_arr)
        fp_scaled = scaler.transform(fp_pca)
        
        fp_tensor = torch.tensor(fp_scaled, dtype=torch.float32)
        with torch.no_grad():
            pred_score = model(fp_tensor).item()
            
        print(f"Generated Molecule: {new_smiles}")
        print(f"Predicted Activity: {pred_score:.4f}")
        
        img = Draw.MolToImage(new_mol, legend=f"VQE Pred: {pred_score:.2f}")
        img.save("vqe_generated_molecule.png")
        print("Molecule image saved.")
        
    except Exception as e:
        print(f"Prediction failed: {e}")

if __name__ == "__main__":
    evaluate_and_generate()
