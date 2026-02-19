import React, {useState} from 'react';

const UsernameModal = ({onConnect, name}) => {
    const [username, setUsername] = useState('');

    const handleConnect = (e) => {
        e.preventDefault();
        if (!username.trim()) {
            alert('Пожалуйста, введите имя');
            return;
        }
        onConnect(username);
    }
    return (
        <div
            className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {}}
        >
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                    <p className="text-gray-600 mt-2">Введите ваше имя для начала игры</p>
                </div>

                <form onSubmit={handleConnect}>
                    <div className="mb-6">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ваше имя"
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn"
                    >
                        Начать игру
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameModal;