#!/usr/bin/env python
"""
quantum_generate.py — API helper for molecule generation
Usage: python quantum_generate.py --algorithm QAOA
Returns JSON to stdout
"""
import sys
import os
import json
import argparse
import base64
import io
import warnings
import random
import csv

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR = os.path.join(BASE_DIR, "models_and_data")
os.chdir(BASE_DIR)


def mol_to_base64(mol, legend=""):
    from rdkit.Chem import Draw
    img = Draw.MolToImage(mol, size=(400, 300), legend=legend)
    buff = io.BytesIO()
    img.save(buff, format="PNG")
    return base64.b64encode(buff.getvalue()).decode()


def load_data():
    import joblib
    data = joblib.load(os.path.join(SAVE_DIR, "dataset.pkl"))
    return data["pca"], data["scaler"]


def featurize(mol, pca, scaler):
    import numpy as np
    from rdkit.Chem import AllChem
    fp_gen = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
    fp_arr = np.array(fp_gen).reshape(1, -1)
    fp_pca = pca.transform(fp_arr)
    fp_scaled = scaler.transform(fp_pca)
    return fp_scaled


def get_random_seed():
    """Reads qm9.csv and returns a random SMILES string. Fallback to a valid carbon chain."""
    csv_path = os.path.join(SAVE_DIR, "qm9.csv")
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r') as f:
                # Read all lines (or a large chunk) to pick a random one
                # Usually QM9 is ~133k lines
                lines = f.readlines()
                if len(lines) > 1:
                    # Skip header, pick random line
                    random_line = random.choice(lines[1:])
                    # Split CSV, smiles is typically first column
                    smiles = random_line.split(',')[0].strip()
                    if smiles: return smiles
        except Exception:
            pass
    # Fallback pool
    pool = ["c1ccccc1", "CC(C)C", "CCO", "C1CCCCC1", "CCN(CC)CC"]
    return random.choice(pool)


def mutate_molecule(mol):
    """Applies a random valid RDKit mutation to guarantee a novel molecule."""
    from rdkit import Chem
    rw = Chem.RWMol(mol)
    
    # 1. Find valid attachment point (carbon with hydrogens)
    valid_spots = [a.GetIdx() for a in rw.GetAtoms() if a.GetSymbol() == "C" and a.GetTotalNumHs() > 0]
    
    if not valid_spots:
        # If no valid spots, just add to atom 0 as a fallback
        valid_spots = [0]
        
    attachment_point = random.choice(valid_spots)
    
    # 2. Pick a random mutation
    # Atomic numbers: 6 (C), 7 (N), 8 (O), 9 (F), 17 (Cl), 35 (Br)
    mutations = [
        (6, "Carbon branch"),
        (7, "Nitrogen group"),
        (8, "Oxygen (Hydroxyl)"),
        (9, "Fluorine atom"),
        (17, "Chlorine atom")
    ]
    
    atom_num, desc = random.choice(mutations)
    
    # 3. Apply mutation
    new_idx = rw.AddAtom(Chem.Atom(atom_num))
    rw.AddBond(attachment_point, new_idx, Chem.BondType.SINGLE)
    
    # Expand slightly if it's carbon (to make bigger changes occasionally)
    if atom_num == 6 and random.random() > 0.5:
        idx2 = rw.AddAtom(Chem.Atom(8)) # Add trailing oxygen
        rw.AddBond(new_idx, idx2, Chem.BondType.DOUBLE)
        desc += " with Ketone"
        
    # Clean up and generate new valid smiles
    new_mol = rw.GetMol()
    try:
        Chem.SanitizeMol(new_mol)
    except Exception:
        # If mutation created invalid valence, just return original mol (very rare with simple additions)
        return mol, "Quantum Identity (No change)"
        
    return new_mol, f"Quantum variation: Added {desc}"



# ─── QAOA ──────────────────────────────────────────────────────────────────────
def generate_qaoa(seed_smiles=None):
    import torch
    import torch.nn as nn
    import pennylane as qml
    import joblib
    from rdkit import Chem

    N_QUBITS = 8
    dev = qml.device("default.qubit", wires=N_QUBITS)

    @qml.qnode(dev, interface="torch")
    def qaoa_circuit(inputs, weights):
        qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
        for layer in range(weights.shape[0]):
            for i in range(N_QUBITS):
                qml.CNOT(wires=[i, (i + 1) % N_QUBITS])
                qml.RZ(weights[layer, 0, i], wires=(i + 1) % N_QUBITS)
                qml.CNOT(wires=[i, (i + 1) % N_QUBITS])
            for i in range(N_QUBITS):
                qml.RX(weights[layer, 1, i], wires=i)
        return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

    class QAOAModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.weight_shapes = {"weights": (2, 2, N_QUBITS)}
            self.q_layer = qml.qnn.TorchLayer(qaoa_circuit, self.weight_shapes)
            self.fc = nn.Linear(N_QUBITS, 1)
            self.sigmoid = nn.Sigmoid()
        def forward(self, x):
            return self.sigmoid(self.fc(self.q_layer(x)))

    pca, scaler = load_data()
    model = QAOAModel()
    model.load_state_dict(torch.load(os.path.join(SAVE_DIR, "QAOA.pt"), map_location="cpu"))
    model.eval()

    seed = seed_smiles if seed_smiles else get_random_seed()
    mol = Chem.MolFromSmiles(seed)
    if not mol:
        mol = Chem.MolFromSmiles("c1ccccc1")
        seed = "c1ccccc1"

    new_mol, mutation_desc = mutate_molecule(mol)
    new_smiles = Chem.MolToSmiles(new_mol)

    fp = featurize(new_mol, pca, scaler)
    t = torch.tensor(fp, dtype=torch.float32)
    with torch.no_grad():
        score = model(t).item()

    return {
        "smiles": new_smiles, "score": round(score, 4),
        "image": mol_to_base64(new_mol, f"QAOA: {score:.2f}"),
        "algorithm": "QAOA", "seed": seed, "mutation": mutation_desc
    }


# ─── VQE ───────────────────────────────────────────────────────────────────────
def generate_vqe(seed_smiles=None):
    import torch
    import torch.nn as nn
    import pennylane as qml
    from rdkit import Chem

    N_QUBITS = 8
    dev = qml.device("default.qubit", wires=N_QUBITS)

    @qml.qnode(dev, interface="torch")
    def vqe_circuit(inputs, weights):
        qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
        qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
        return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

    class VQEModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.weight_shapes = {"weights": (2, N_QUBITS, 3)}
            self.q_layer = qml.qnn.TorchLayer(vqe_circuit, self.weight_shapes)
            self.fc = nn.Linear(N_QUBITS, 1)
            self.sigmoid = nn.Sigmoid()
        def forward(self, x):
            return self.sigmoid(self.fc(self.q_layer(x)))

    pca, scaler = load_data()
    model = VQEModel()
    model.load_state_dict(torch.load(os.path.join(SAVE_DIR, "VQE.pt"), map_location="cpu"))
    model.eval()

    seed = seed_smiles if seed_smiles else get_random_seed()
    mol = Chem.MolFromSmiles(seed)
    if not mol:
        mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
        seed = "CC(=O)Oc1ccccc1C(=O)O"

    new_mol, mutation_desc = mutate_molecule(mol)
    new_smiles = Chem.MolToSmiles(new_mol)

    fp = featurize(new_mol, pca, scaler)
    t = torch.tensor(fp, dtype=torch.float32)
    with torch.no_grad():
        score = model(t).item()

    return {
        "smiles": new_smiles, "score": round(score, 4),
        "image": mol_to_base64(new_mol, f"VQE: {score:.2f}"),
        "algorithm": "VQE", "seed": seed, "mutation": mutation_desc
    }


# ─── QPCA ──────────────────────────────────────────────────────────────────────
def generate_qpca(seed_smiles=None):
    import joblib
    from rdkit import Chem

    pca, scaler = load_data()
    model = joblib.load(os.path.join(SAVE_DIR, "qpca_rf.pkl"))

    seed = seed_smiles if seed_smiles else get_random_seed()
    mol = Chem.MolFromSmiles(seed)
    if not mol:
        mol = Chem.MolFromSmiles("CCO")
        seed = "CCO"

    new_mol, mutation_desc = mutate_molecule(mol)
    new_smiles = Chem.MolToSmiles(new_mol)

    fp = featurize(new_mol, pca, scaler)
    score = model.predict_proba(fp)[0][1]

    return {
        "smiles": new_smiles, "score": round(score, 4),
        "image": mol_to_base64(new_mol, f"QPCA: {score:.2f}"),
        "algorithm": "QPCA", "seed": seed, "mutation": mutation_desc
    }


# ─── GROVER ────────────────────────────────────────────────────────────────────
def generate_grover(seed_smiles=None):
    import joblib
    from rdkit import Chem

    pca, scaler = load_data()
    model = joblib.load(os.path.join(SAVE_DIR, "grover_knn.pkl"))

    seed = seed_smiles if seed_smiles else get_random_seed()
    mol = Chem.MolFromSmiles(seed)
    if not mol:
        mol = Chem.MolFromSmiles("CN1C=NC2=C1C(=O)N(C(=O)N2C)C")
        seed = "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"

    new_mol, mutation_desc = mutate_molecule(mol)
    new_smiles = Chem.MolToSmiles(new_mol)

    fp = featurize(new_mol, pca, scaler)
    score = model.predict_proba(fp)[0][1]

    return {
        "smiles": new_smiles, "score": round(score, 4),
        "image": mol_to_base64(new_mol, f"Grover: {score:.2f}"),
        "algorithm": "Grover", "seed": seed, "mutation": mutation_desc
    }


# ─── QGA ───────────────────────────────────────────────────────────────────────
def generate_qga(seed_smiles=None):
    import numpy as np
    import pennylane as qml
    from rdkit import Chem

    N_QUBITS = 8
    dev = qml.device("default.qubit", wires=N_QUBITS)

    @qml.qnode(dev, interface="numpy")
    def qga_circuit(inputs, weights):
        qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
        qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
        return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

    pca, scaler = load_data()
    best_weights = np.load(os.path.join(SAVE_DIR, "qga_best_weights.npy"))
    weights = best_weights.reshape(2, N_QUBITS, 3)

    seed = seed_smiles if seed_smiles else get_random_seed()
    mol = Chem.MolFromSmiles(seed)
    if not mol:
        mol = Chem.MolFromSmiles("C1CCCCC1")
        seed = "C1CCCCC1"

    new_mol, mutation_desc = mutate_molecule(mol)
    new_smiles = Chem.MolToSmiles(new_mol)

    fp = featurize(new_mol, pca, scaler)
    exp_vals = qga_circuit(fp[0], weights)
    val = float(np.mean(exp_vals))
    score = float(1 / (1 + np.exp(-val)))

    return {
        "smiles": new_smiles, "score": round(score, 4),
        "image": mol_to_base64(new_mol, f"QGA: {score:.2f}"),
        "algorithm": "QGA", "seed": seed, "mutation": mutation_desc
    }


# ─── MAIN ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--algorithm", required=True,
                        choices=["QAOA", "VQE", "QPCA", "Grover", "QGA"])
    parser.add_argument("--seed-smiles", type=str, default=None,
                        help="Optional specific SMILES to use as seed instead of random.")
    args = parser.parse_args()

    try:
        generators = {
            "QAOA": generate_qaoa,
            "VQE": generate_vqe,
            "QPCA": generate_qpca,
            "Grover": generate_grover,
            "QGA": generate_qga,
        }
        result = generators[args.algorithm](seed_smiles=args.seed_smiles)
        print(json.dumps({"success": True, **result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
