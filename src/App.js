import React, { useState, useEffect } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';

function App() {
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('income');
    const [darkMode, setDarkMode] = useState(false);

    const clearHistory = () => {
        const currentBalance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        setTransactions([]);
        localStorage.setItem('transactions', JSON.stringify([]));

        // Mantém o saldo atualizado
        if (currentBalance !== 0) {
            const balanceTransaction = {
                id: Date.now(),
                description: 'Saldo inicial',
                amount: currentBalance,
                type: currentBalance > 0 ? 'income' : 'expense'
            };
            setTransactions([balanceTransaction]);
            localStorage.setItem('transactions', JSON.stringify([balanceTransaction]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!description || !date || !amount) return;

        const newTransaction = {
            id: Date.now(),
            description,
            date,
            amount: type === 'income' ? +amount : -amount,
            type
        };

        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        setDescription('');
        setAmount('');
    };

    const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Histórico de Transações', 10, 20);

        doc.setFontSize(12);
        if (balance < 0) {
            doc.setTextColor('#dc3545');
        }
        doc.text(`Saldo: R$ ${balance.toFixed(2)}`, 10, 30);
        doc.setTextColor('#000000');

        doc.setFontSize(14);
        doc.text('Transações:', 10, 40);

        let yPosition = 50;
        transactions.forEach(transaction => {
            const formattedDate = transaction.date ?
                `${transaction.date.split('-')[2]}/${transaction.date.split('-')[1]}/${transaction.date.split('-')[0]}` :
                'Sem data';
            const text = `${formattedDate} - ${transaction.description}: R$ ${transaction.type === 'expense' ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)} (${transaction.type === 'income' ? 'Entrada' : 'Saída'})`;

            if (transaction.type === 'expense' || transaction.amount < 0) {
                doc.setTextColor('#dc3545');
            }
            doc.text(text, 10, yPosition);
            doc.setTextColor('#000000');
            yPosition += 10;
        });

        doc.save('historico-financeiro.pdf');
    };

    useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : '';
    }, [darkMode]);

    return (
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
            <div className="header-controls">
                <h1>Controle Financeiro</h1>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="theme-toggle"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                    onClick={clearHistory}
                    className="clear-btn"
                >
                    Limpar Histórico
                </button>
                <button
                    onClick={generatePDF}
                    className="pdf-btn"
                >
                    Gerar PDF
                </button>
            </div>

            <div className="balance">
                <h2>Saldo: R$ {balance.toFixed(2)}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Descrição:
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => {
                                const value = e.target.value;
                                setDescription(value.charAt(0).toUpperCase() + value.slice(1));
                            }}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Data:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Valor:
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Tipo:
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="income">Entrada</option>
                            <option value="expense">Saída</option>
                        </select>
                    </label>
                </div>

                <button type="submit">Adicionar</button>
            </form>

            <div className="transactions">
                <h2>Histórico</h2>
                <ul>
                    {transactions.map(transaction => (
                        <li key={transaction.id} className={transaction.type}>
                            {transaction.date} - {transaction.description}: R$ {transaction.type === 'expense' ? '-' : ''}{Math.abs(transaction.amount).toFixed(2)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;