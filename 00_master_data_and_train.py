import os
import time
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
import pennylane as qml
import requests
from io import StringIO
from tqdm import tqdm
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
from rdkit import Chem
from rdkit.Chem import AllChem

# ==========================================
# CONFIGURATION & CONSTANTS
# ==========================================
SEED = 42
np.random.seed(SEED)
torch.manual_seed(SEED)

TRAIN_SIZE = 35000
TEST_SIZE = 10000
NEW_SIZE = 5000
TOTAL_REQUIRED = TRAIN_SIZE + TEST_SIZE + NEW_SIZE

N_QUBITS = 8  # Compress features to 8 for 8 qubits
EPOCHS = 25
BATCH_SIZE = 32
LEARNING_RATE = 0.005 # Slightly lower LR to prevent overfitting/oscillations
SAVE_DIR = "models_and_data"
DATASET_PATH = os.path.join(SAVE_DIR, "dataset.pkl")
QM9_URL = "https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/qm9.csv"
QM9_CSV_PATH = os.path.join(SAVE_DIR, "qm9.csv")

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# ==========================================
# 1. DATA LOADING & PROCESSING
# ==========================================
def download_qm9():
    if os.path.exists(QM9_CSV_PATH):
        print(f"QM9 CSV found at {QM9_CSV_PATH}")
        return
    
    print("Downloading QM9 dataset from DeepChem S3...")
    try:
        response = requests.get(QM9_URL, stream=True)
        response.raise_for_status()
        total_size = int(response.headers.get('content-length', 0))
        
        with open(QM9_CSV_PATH, 'wb') as f, tqdm(
            desc="Downloading QM9",
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in response.iter_content(chunk_size=1024):
                size = f.write(data)
                bar.update(size)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download QM9: {e}")
        # Create a dummy CSV if download fails to prevent crash during demo
        print("Creating DUMMY QM9 data for demonstration...")
        dummy_df = pd.DataFrame({
            'smiles': ['C']*55000, 
            'gap': np.random.rand(55000)
        })
        dummy_df.to_csv(QM9_CSV_PATH, index=False)

def featurize_smiles(smiles_list):
    fps = []
    valid_indices = []
    print("Featurizing molecules with RDKit ECFP...")
    
    for i, smi in enumerate(tqdm(smiles_list)):
        try:
            mol = Chem.MolFromSmiles(smi)
            if mol:
                # ECFP4 (Radius 2), 1024 bits
                fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
                fps.append(np.array(fp))
                valid_indices.append(i)
        except:
            continue
            
    return np.array(fps), valid_indices

def load_and_process_data():
    # PERSISTENCE CHECK
    if os.path.exists(DATASET_PATH):
        print(f"Index file found at {DATASET_PATH}. Loading persistent data...")
        try:
            data = joblib.load(DATASET_PATH)
            print("Data loaded successfully.")
            return data["X_train"], data["y_train"], data["X_test"], data["y_test"], data["X_new"], data["y_new"]
        except:
            print("Failed to load persistence file. Re-processing.")

    # Download if needed
    download_qm9()
    
    # Load CSV
    print("Reading QM9 CSV...")
    df = pd.read_csv(QM9_CSV_PATH)
    
    # Sample if too large (QM9 is ~134k)
    if len(df) > (TOTAL_REQUIRED + 5000):
        df = df.sample(n=(TOTAL_REQUIRED + 5000), random_state=SEED)
    
    # Target: 'gap' (HOMO-LUMO gap)
    target_col = 'gap'
    if 'gap' not in df.columns:
        possible_targets = [c for c in df.columns if 'gap' in c or 'u0' in c]
        if possible_targets:
            target_col = possible_targets[0]
        else: 
            target_col = df.columns[-1]
            
    print(f"Using target column: {target_col}")
    
    # Featurize
    X_raw, valid_idxs = featurize_smiles(df['smiles'].values)
    y_raw = df[target_col].values[valid_idxs]
    
    # Binarize Target
    threshold = np.median(y_raw)
    y_bin = (y_raw > threshold).astype(int)
    
    # Shuffle
    indices = np.arange(len(X_raw))
    np.random.shuffle(indices)
    
    # Split
    if len(indices) < TOTAL_REQUIRED:
        print(f"WARNING: Available valid data {len(indices)} < Requested {TOTAL_REQUIRED}")
        print("Adjusting splits proportionally...")
        # Simple proportional split
        n = len(indices)
        train_end = int(n * 0.7)
        test_end = int(n * 0.9)
        
        train_indices = indices[:train_end]
        test_indices = indices[train_end:test_end]
        new_indices = indices[test_end:]
    else:
        train_end = TRAIN_SIZE
        test_end = TRAIN_SIZE + TEST_SIZE
        new_end = test_end + NEW_SIZE
        
        train_indices = indices[:train_end]
        test_indices = indices[train_end:test_end]
        new_indices = indices[test_end:new_end]
        
    X_train_raw = X_raw[train_indices]
    y_train = y_bin[train_indices]
    X_test_raw = X_raw[test_indices]
    y_test = y_bin[test_indices]
    X_new_raw = X_raw[new_indices]
    y_new = y_bin[new_indices]
    
    print(f"Splits: Train={len(X_train_raw)}, Test={len(X_test_raw)}, New(Validation)={len(X_new_raw)}")

    # PCA Compression
    print("Compressing features with PCA...")
    pca = PCA(n_components=N_QUBITS)
    X_train_pca = pca.fit_transform(X_train_raw)
    X_test_pca = pca.transform(X_test_raw)
    X_new_pca = pca.transform(X_new_raw)
    
    # Normalize to [0, pi]
    scaler = MinMaxScaler(feature_range=(0, np.pi))
    X_train = scaler.fit_transform(X_train_pca)
    X_test = scaler.transform(X_test_pca)
    X_new = scaler.transform(X_new_pca)
    
    # Save Data
    data_dict = {
        "X_train": X_train, "y_train": y_train,
        "X_test": X_test, "y_test": y_test,
        "X_new": X_new, "y_new": y_new,
        "pca": pca, "scaler": scaler,
        "threshold": threshold
    }
    joblib.dump(data_dict, DATASET_PATH)
    print("Data processed and saved locally for persistence.")
    
    return X_train, y_train, X_test, y_test, X_new, y_new

# ==========================================
# 2. QUANTUM LAYERS (PennyLane)
# ==========================================
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="torch")
def qaoa_circuit(inputs, weights):
    # Angle Embedding
    qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
    # QAOA-like Ansatz
    for layer in range(weights.shape[0]):
        # Cost
        for i in range(N_QUBITS):
            qml.CNOT(wires=[i, (i + 1) % N_QUBITS])
            qml.RZ(weights[layer, 0, i], wires=(i + 1) % N_QUBITS)
            qml.CNOT(wires=[i, (i + 1) % N_QUBITS])
        # Mixer
        for i in range(N_QUBITS):
            qml.RX(weights[layer, 1, i], wires=i)
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

@qml.qnode(dev, interface="torch")
def vqe_circuit(inputs, weights):
    qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
    qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

# ==========================================
# 3. MODELS
# ==========================================

class QAOAModel(nn.Module):
    def __init__(self, n_layers=2):
        super().__init__()
        self.n_layers = n_layers
        self.weight_shapes = {"weights": (n_layers, 2, N_QUBITS)}
        self.q_layer = qml.qnn.TorchLayer(qaoa_circuit, self.weight_shapes)
        self.fc = nn.Linear(N_QUBITS, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.q_layer(x)
        x = self.fc(x)
        return self.sigmoid(x)

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

# ==========================================
# 4. TRAINING FUNCTIONS
# ==========================================
def train_torch_model(model, train_loader, epochs, name="Model"):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    model.train()
    print(f"\nTraining {name}...")
    for epoch in range(epochs):
        epoch_loss = 0
        # Use simple loop or tqdm
        with tqdm(train_loader, unit="batch", leave=False) as tepoch:
            tepoch.set_description(f"Epoch {epoch+1}/{epochs}")
            for data, target in tepoch:
                optimizer.zero_grad()
                output = model(data)
                loss = criterion(output, target.float().view(-1, 1))
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
                tepoch.set_postfix(loss=loss.item())
        print(f"Epoch {epoch+1}: Loss {epoch_loss/len(train_loader):.4f}")
                
    torch.save(model.state_dict(), os.path.join(SAVE_DIR, f"{name}.pt"))
    print(f"{name} saved.")

def train_qpca_ensemble(X_train, y_train):
    print("\nTraining QPCA-Hybrid (Random Forest)...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=SEED)
    clf.fit(X_train, y_train)
    joblib.dump(clf, os.path.join(SAVE_DIR, "qpca_rf.pkl"))
    print("QPCA Model saved.")

def train_grover_knn(X_train, y_train):
    print("\nTraining Grover-Inspired k-NN...")
    knn = KNeighborsClassifier(n_neighbors=5, metric='cosine')
    knn.fit(X_train, y_train)
    joblib.dump(knn, os.path.join(SAVE_DIR, "grover_knn.pkl"))
    print("Grover k-NN Model saved.")

def train_qga(X_train, y_train):
    print("\nTraining Quantum Genetic Algorithm (QGA)...")
    
    pop_size = 20
    generations = 10 
    mutation_rate = 0.1
    elite_size = 2
    
    n_params = 2 * N_QUBITS * 3
    population = np.random.uniform(-np.pi, np.pi, (pop_size, n_params))
    
    @qml.qnode(dev, interface="numpy")
    def qga_circuit_eval(inputs, weights):
        qml.AngleEmbedding(inputs, wires=range(N_QUBITS))
        qml.StronglyEntanglingLayers(weights, wires=range(N_QUBITS))
        return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

    def fitness_func(weights_flat, X_batch, y_batch):
        weights = weights_flat.reshape(2, N_QUBITS, 3)
        preds = []
        limit = 50 
        for i in range(min(len(X_batch), limit)):
            exp_vals = qga_circuit_eval(X_batch[i], weights)
            val = np.mean(exp_vals)
            preds.append(1 if val > 0 else 0)
        
        acc = accuracy_score(y_batch[:limit], preds)
        return acc

    X_sample = X_train[:100]
    y_sample = y_train[:100]

    for gen in range(generations):
        fitness_scores = []
        # Simple loop without tqdm to avoid visual clutter in nested
        for ind in population:
            score = fitness_func(ind, X_sample, y_sample)
            fitness_scores.append(score)
        
        fitness_scores = np.array(fitness_scores)
        sorted_idx = np.argsort(fitness_scores)[::-1]
        population = population[sorted_idx]
        
        new_pop = list(population[:elite_size])
        while len(new_pop) < pop_size:
            parent1 = population[np.random.randint(0, pop_size//2)]
            parent2 = population[np.random.randint(0, pop_size//2)]
            child = (parent1 + parent2) / 2.0
            if np.random.rand() < mutation_rate:
                mutation = np.random.normal(0, 0.5, child.shape)
                child += mutation
            new_pop.append(child)
            
        population = np.array(new_pop)
        print(f"Gen {gen+1} Best Fitness: {fitness_scores[sorted_idx[0]]:.4f}")
        
    best_weights = population[0]
    np.save(os.path.join(SAVE_DIR, "qga_best_weights.npy"), best_weights)
    print("QGA Best Weights saved.")

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    # 1. Data
    # Unpack 6 values
    X_train, y_train, X_test, y_test, X_new, y_new = load_and_process_data()
    
    # Convert to Torch
    X_train_torch = torch.tensor(X_train, dtype=torch.float32)
    y_train_torch = torch.tensor(y_train, dtype=torch.float32)
    
    train_dataset = torch.utils.data.TensorDataset(X_train_torch, y_train_torch)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # 2. Train QAOA
    qaoa_model = QAOAModel()
    train_torch_model(qaoa_model, train_loader, EPOCHS, "QAOA")
    
    # 3. Train VQE
    vqe_model = VQEModel()
    train_torch_model(vqe_model, train_loader, EPOCHS, "VQE")
    
    # 4. Train QPCA (RF)
    train_qpca_ensemble(X_train, y_train)
    
    # 5. Train Grover (KNN)
    train_grover_knn(X_train, y_train)
    
    # 6. Train QGA
    train_qga(X_train, y_train)
    
    print("\nAll models trained and saved successfully.")
