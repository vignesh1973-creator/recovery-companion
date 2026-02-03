import React, { useState } from 'react';
import './WalletModal.css';

const WalletModal = ({ reasons, onAdd, onDelete, onClose }) => {
    const [newReason, setNewReason] = useState('');

    const handleAdd = () => {
        if (!newReason.trim()) return;
        onAdd(newReason);
        setNewReason('');
    };

    return (
        <div className="modal-overlay">
            <div className="wallet-modal">
                <div className="wallet-header">
                    <h2>Reason to Recover Wallet</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <p className="wallet-sub">These cards will be shown to you when you hit the Panic button. Remind your future self why you started.</p>

                <div className="wallet-list">
                    {reasons.length === 0 && <p className="empty-wallet">No cards added yet. Add your "Why" below.</p>}

                    {reasons.map((r, i) => (
                        <div key={i} className="wallet-card">
                            <span>{r}</span>
                            <button onClick={() => onDelete(i)}>&times;</button>
                        </div>
                    ))}
                </div>

                <div className="wallet-input">
                    <input
                        type="text"
                        placeholder="e.g. For my daughter..."
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button className="btn-primary" onClick={handleAdd}>Add Card</button>
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
